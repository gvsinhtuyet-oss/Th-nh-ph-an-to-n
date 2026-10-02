import { 
  JourneyProgress, 
  StageProgress, 
  ActivityProgress, 
  StagePhase, 
  Reward, 
  KnowledgeCard,
  Journey,
  Stage,
  TaskProgress,
  Grade
} from '../types';
import { idbGet, idbGetAll, idbPut, STORES } from '../db/indexedDb';
import { addInventoryItem, addKnowledgeCard, createOrGetCertificate } from './rewardService';
import { getStudentProfile, addStarsToProfile } from './profileService';

export async function getJourneyProgress(journeyId: string): Promise<JourneyProgress> {
  const existing = await idbGet<JourneyProgress>(STORES.PROGRESS, journeyId);
  if (existing) {
    return existing;
  }

  // Create initial progress for this journey
  const initial: JourneyProgress = {
    journeyId,
    journeyVersionId: `${journeyId}-v1`,
    studentId: 'local-student',
    stages: {},
    unlockedStageOrders: [1], // Stage 1 is initially unlocked!
    currentStageOrder: 1,
    completed: false,
    totalScore: 0,
    cityRewardGranted: false,
    completionCelebrated: false,
  };

  await idbPut<JourneyProgress>(STORES.PROGRESS, initial);
  return initial;
}

export async function getStageProgress(journeyId: string, stage: Stage): Promise<StageProgress> {
  const journeyProg = await getJourneyProgress(journeyId);
  const existingStage = journeyProg.stages[stage.id];

  if (existingStage) {
    return existingStage;
  }

  // Determine initial phase: if intro has description/media -> intro, else theory
  const initialPhase: StagePhase = stage.intro.description || stage.intro.mediaUrl ? 'intro' : 'theory';

  const newStageProg: StageProgress = {
    stageId: stage.id,
    stageOrder: stage.order,
    phase: initialPhase,
    introCompleted: !stage.intro.required && !stage.intro.description && !stage.intro.mediaUrl,
    theoryCompleted: !stage.theory.requiredBeforePractice && !stage.theory.content,
    activitiesProgress: {},
    completed: false,
    rewardClaimed: false,
  };

  journeyProg.stages[stage.id] = newStageProg;
  await idbPut<JourneyProgress>(STORES.PROGRESS, journeyProg);
  return newStageProg;
}

export async function updateStagePhase(
  journeyId: string, 
  stageId: string, 
  phase: StagePhase
): Promise<JourneyProgress> {
  const journeyProg = await getJourneyProgress(journeyId);
  if (journeyProg.stages[stageId]) {
    journeyProg.stages[stageId].phase = phase;
    await idbPut<JourneyProgress>(STORES.PROGRESS, journeyProg);
  }
  return journeyProg;
}

export async function setTheoryCompleted(
  journeyId: string, 
  stageId: string
): Promise<StageProgress> {
  const journeyProg = await getJourneyProgress(journeyId);
  if (!journeyProg.stages[stageId]) {
    journeyProg.stages[stageId] = {
      stageId,
      stageOrder: 1,
      phase: 'theory',
      introCompleted: true,
      theoryCompleted: true,
      activitiesProgress: {},
      completed: false,
      rewardClaimed: false,
    };
  }
  journeyProg.stages[stageId].theoryCompleted = true;
  journeyProg.stages[stageId].phase = 'practice';
  await idbPut<JourneyProgress>(STORES.PROGRESS, journeyProg);
  return journeyProg.stages[stageId];
}

export async function setIntroCompleted(
  journeyId: string, 
  stageId: string
): Promise<StageProgress> {
  const journeyProg = await getJourneyProgress(journeyId);
  if (journeyProg.stages[stageId]) {
    journeyProg.stages[stageId].introCompleted = true;
    journeyProg.stages[stageId].phase = 'theory';
    await idbPut<JourneyProgress>(STORES.PROGRESS, journeyProg);
  }
  return journeyProg.stages[stageId];
}

// STRICT SCORING RULE:
// Only award score if correct on FIRST attempt.
// If wrong on first attempt: scoreEarned = 0, firstAttemptCorrect = false, scoreFinalized = true.
// On retry if correct: completed = true, but scoreEarned REMAINS 0.
export async function recordActivityAttempt(
  journeyId: string,
  stageId: string,
  activityId: string,
  isCorrect: boolean,
  activityScore: number,
  isReplay: boolean = false
): Promise<{
  activityProgress: ActivityProgress;
  isFirstAttempt: boolean;
  scoreAwardedThisAttempt: number;
}> {
  const journeyProg = await getJourneyProgress(journeyId);
  if (!journeyProg.stages[stageId]) {
    journeyProg.stages[stageId] = {
      stageId,
      stageOrder: 1,
      phase: 'practice',
      introCompleted: true,
      theoryCompleted: true,
      activitiesProgress: {},
      completed: false,
      rewardClaimed: false,
    };
  }

  const stageProg = journeyProg.stages[stageId];
  let actProg = stageProg.activitiesProgress[activityId];

  const isFirstAttempt = !actProg || actProg.attemptCount === 0;

  if (isFirstAttempt) {
    actProg = {
      activityId,
      attemptCount: 1,
      firstAttemptCorrect: isCorrect,
      scoreEarned: isCorrect ? activityScore : 0,
      scoreFinalized: true,
      completed: isCorrect,
      completedAt: isCorrect ? new Date().toISOString() : undefined,
    };

    if (!isReplay && isCorrect) {
      journeyProg.totalScore += activityScore;
      await addStarsToProfile(Math.max(1, Math.floor(activityScore / 10)));
    }
  } else {
    // Retry attempt
    actProg.attemptCount += 1;
    if (isCorrect) {
      actProg.completed = true;
      actProg.completedAt = actProg.completedAt || new Date().toISOString();
      // Crucial: scoreEarned remains 0 if first attempt was wrong!
    }
  }

  stageProg.activitiesProgress[activityId] = actProg;
  await idbPut<JourneyProgress>(STORES.PROGRESS, journeyProg);

  return {
    activityProgress: actProg,
    isFirstAttempt,
    scoreAwardedThisAttempt: isFirstAttempt && isCorrect && !isReplay ? activityScore : 0,
  };
}

// TRANSACTION FOR STAGE COMPLETION
export async function completeStageTransaction(
  journey: Journey,
  stage: Stage,
  isReplay: boolean = false
): Promise<{
  success: boolean;
  rewardClaimed: boolean;
  nextStageOrderUnlocked: number | null;
}> {
  const journeyProg = await getJourneyProgress(journey.id);
  const stageProg = journeyProg.stages[stage.id];

  if (!stageProg) {
    return { success: false, rewardClaimed: false, nextStageOrderUnlocked: null };
  }

  // 1. Mark stage completed & calculate 3 assessment levels (Thông tư 27)
  stageProg.completed = true;
  stageProg.phase = 'completed';
  stageProg.completedAt = stageProg.completedAt || new Date().toISOString();

  let stageScore = 0;
  let stageMaxScore = 0;
  for (const act of stage.activities) {
    stageMaxScore += act.score || 10;
    const actProg = stageProg.activitiesProgress[act.id];
    if (actProg && actProg.scoreEarned) {
      stageScore += actProg.scoreEarned;
    }
  }
  stageProg.score = stageScore;
  stageProg.maxScore = stageMaxScore;
  const pct = stageMaxScore > 0 ? (stageScore / stageMaxScore) * 100 : 100;
  if (pct >= 80) {
    stageProg.rating = 'T';
    stageProg.ratingText = 'Hoàn thành tốt';
  } else if (pct >= 50) {
    stageProg.rating = 'H';
    stageProg.ratingText = 'Hoàn thành';
  } else {
    stageProg.rating = 'C';
    stageProg.ratingText = 'Chưa hoàn thành';
  }

  // 2. Grant Reward once
  let rewardClaimed = false;
  if (!stageProg.rewardClaimed && !isReplay) {
    if (stage.reward.type === 'knowledge_card') {
      const card: KnowledgeCard = {
        id: stage.reward.id,
        title: stage.reward.name,
        keyTakeaway: stage.keyTakeaway,
        journeyId: journey.id,
        journeyTitle: journey.title,
        stageId: stage.id,
        stageOrder: stage.order,
        unlockedAt: new Date().toISOString(),
      };
      await addKnowledgeCard(card);
    } else {
      await addInventoryItem(stage.reward);
    }
    stageProg.rewardClaimed = true;
    rewardClaimed = true;
  }

  // 3. Derive next stage unlock (supports any number of stops/stages)
  let nextOrderUnlocked: number | null = null;
  const nextOrder = stage.order + 1;
  const maxStages = journey.stages?.length || 7;
  if (nextOrder <= maxStages && !journeyProg.unlockedStageOrders.includes(nextOrder)) {
    journeyProg.unlockedStageOrders.push(nextOrder);
    nextOrderUnlocked = nextOrder;
  }

  // 4. Save local progress
  await idbPut<JourneyProgress>(STORES.PROGRESS, journeyProg);

  // 5. Persist to TASK_PROGRESS if this is a LearningTask
  if (stage.id.startsWith('task-')) {
    const taskProg: TaskProgress = {
      taskId: stage.id,
      missionId: journey.id,
      grade: (stage.primaryGrade || journey.grade) as any,
      orderInGrade: stage.order,
      phase: stageProg.phase,
      introCompleted: stageProg.introCompleted,
      theoryCompleted: stageProg.theoryCompleted,
      activitiesProgress: stageProg.activitiesProgress,
      completed: stageProg.completed,
      completedAt: stageProg.completedAt,
      rewardClaimed: stageProg.rewardClaimed,
      score: stageProg.score || 0,
      maxScore: stageProg.maxScore || 30,
      rating: stageProg.rating,
      ratingText: stageProg.ratingText,
    };
    await idbPut<TaskProgress>(STORES.TASK_PROGRESS, taskProg);
  }

  return {
    success: true,
    rewardClaimed,
    nextStageOrderUnlocked: nextOrderUnlocked,
  };
}

// FINAL JOURNEY COMPLETION
export async function completeJourneyTransaction(
  journey: Journey,
  isReplay: boolean = false
): Promise<{
  firstTimeCompleted: boolean;
  certificateCode: string;
}> {
  const journeyProg = await getJourneyProgress(journey.id);
  const profile = await getStudentProfile();

  const isFirstTime = !journeyProg.completed;

  if (isFirstTime && !isReplay) {
    journeyProg.completed = true;
    journeyProg.completedAt = new Date().toISOString();
    journeyProg.cityRewardGranted = true;
    journeyProg.completionCelebrated = true;

    // Award final badge to backpack
    const finalBadgeReward: Reward = {
      id: `final-badge-${journey.id}`,
      name: journey.finalBadge.name,
      type: 'badge',
      icon: journey.finalBadge.icon,
      description: journey.finalBadge.description,
      journeyId: journey.id,
      stageId: `${journey.id}-s7`,
      unlockedAt: new Date().toISOString(),
    };
    await addInventoryItem(finalBadgeReward);
  }

  // Persistent certificate
  const cert = await createOrGetCertificate(
    journey.id,
    journey.title,
    journey.grade,
    journeyProg.totalScore,
    journey.maxScore,
    journey.finalBadge,
    profile.nickname
  );

  journeyProg.certificateCode = cert.certificateCode;
  await idbPut<JourneyProgress>(STORES.PROGRESS, journeyProg);

  return {
    firstTimeCompleted: isFirstTime && !isReplay,
    certificateCode: cert.certificateCode,
  };
}

// ROUTE GUARD: Check if stage order is unlocked
export function isStageAccessible(
  unlockedOrders: number[], 
  stageOrder: number
): boolean {
  if (stageOrder === 1) return true;
  return unlockedOrders.includes(stageOrder);
}

export async function getTaskProgress(taskId: string): Promise<TaskProgress | null> {
  return idbGet<TaskProgress>(STORES.TASK_PROGRESS, taskId);
}

export async function getAllTaskProgress(): Promise<TaskProgress[]> {
  return idbGetAll<TaskProgress>(STORES.TASK_PROGRESS);
}

export async function getGradeCompletedTaskCount(grade: Grade): Promise<number> {
  const all = await getAllTaskProgress();
  return all.filter(t => t.grade === grade && t.completed).length;
}
