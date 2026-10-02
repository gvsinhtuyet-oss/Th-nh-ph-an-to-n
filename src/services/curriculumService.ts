import { Journey, Stage, Activity, JourneyStatus, Mission, MissionStop, Grade, LearningTask } from '../types';
import { idbGet, idbGetAll, idbPut, STORES } from '../db/indexedDb';
import { buildDefaultCurriculum, SEED_VERSION } from '../data/curriculumSeed';
import { 
  buildDefaultLearningTasks, 
  buildDefaultMissionsWithTasks, 
  CURRICULUM_VERSION 
} from '../data/learningTasksSeed';
import { buildDefaultMissions } from '../data/missionsSeed';

const SEED_KEY = 'curriculum_seed_version';
const MISSION_SEED_KEY = 'missions_tasks_seed_version_2026_1';

// Convert a LearningTask into a Stage for seamless backward compatibility with StageLearningPage
export function convertTaskToStage(task: LearningTask): Stage {
  return {
    id: task.id,
    journeyId: task.missionId,
    order: task.orderInGrade,
    title: task.title,
    gameTitle: task.gameTitle || task.title,
    icon: task.icon || '🎯',
    intro: task.intro || {
      type: 'song',
      title: `Khởi động: ${task.title}`,
      description: `Khám phá nội dung: ${task.sourceSections.join(' • ')}`,
      required: false,
    },
    theory: task.theory || {
      title: task.title,
      content: `Nội dung nguồn: ${task.sourceSections.join(' • ')}.`,
      sourceIds: task.sourceSections,
      verified: true,
      requiredBeforePractice: true,
      allowedForRita: true,
    },
    activities: task.activities || [],
    keyTakeaway: task.keyTakeaway || `Ghi nhớ an toàn: ${task.title}.`,
    reward: task.reward || {
      id: `rw-${task.id}`,
      name: `Huy Hiệu ${task.title}`,
      type: 'badge',
      icon: task.icon || '🏅',
      description: `Hoàn thành xuất sắc nhiệm vụ: ${task.title}`,
      journeyId: task.missionId,
      stageId: task.id,
    },
    isFinalStage: false,
    stopCode: String(task.orderInGrade),
    targetGrades: [task.grade],
    primaryGrade: task.grade,
  };
}

// Convert a Mission into a Journey for backward compatibility with JourneyMapPage
export function convertMissionToJourneySync(mission: Mission, tasks: LearningTask[]): Journey {
  const missionTasks = tasks.filter(t => t.missionId === mission.id).sort(
    (a, b) => a.orderInMission - b.orderInMission
  );

  const stages = missionTasks.map((t, idx) => {
    const s = convertTaskToStage(t);
    s.order = idx + 1;
    if (idx === missionTasks.length - 1) s.isFinalStage = true;
    return s;
  });

  return {
    id: mission.id,
    grade: 1,
    title: mission.title,
    gameTitle: mission.gameTitle || mission.title,
    icon: mission.icon || '🏙️',
    districtId: mission.districtId || 'school-zone',
    districtName: mission.districtName || 'Khu trung tâm',
    status: mission.status || 'published',
    version: 1,
    versionId: `${mission.id}-${CURRICULUM_VERSION}`,
    stages: stages,
    finalBadge: mission.finalBadge || {
      name: `Huy Hiệu ${mission.title}`,
      icon: mission.icon || '🏅',
      description: `Hoàn thành xuất sắc ${mission.title}`,
    },
    maxScore: stages.length * 30,
    createdAt: mission.createdAt || new Date().toISOString(),
    updatedAt: mission.updatedAt || new Date().toISOString(),
    curriculumVersion: CURRICULUM_VERSION,
  };
}

export async function seedDefaultCurriculum(): Promise<void> {
  // 1. Seed the 10 Missions & 24 Learning Tasks (curriculumVersion = "10-mission-24-task-2026.1")
  const existingSeed = await idbGet<{ key: string; value: string }>(STORES.SETTINGS, MISSION_SEED_KEY);
  const existingTasks = await idbGetAll<LearningTask>(STORES.LEARNING_TASKS);

  if (existingSeed?.value !== CURRICULUM_VERSION || existingTasks.length < 24) {
    const defaultTasks = buildDefaultLearningTasks();
    for (const task of defaultTasks) {
      await idbPut<LearningTask>(STORES.LEARNING_TASKS, task);
    }

    const defaultMissions = buildDefaultMissionsWithTasks();
    for (const mission of defaultMissions) {
      await idbPut<Mission>(STORES.MISSIONS, mission);
    }

    await idbPut(STORES.SETTINGS, { key: MISSION_SEED_KEY, value: CURRICULUM_VERSION });
  }

  // 2. Archive 25 Legacy Journeys (legacyCurriculum = true, archived = true, KHÔNG hard delete)
  const existingLegacySeed = await idbGet<{ key: string; value: string }>(STORES.SETTINGS, SEED_KEY);
  const existingJourneys = await idbGetAll<Journey>(STORES.JOURNEYS);

  if (existingLegacySeed?.value !== SEED_VERSION || existingJourneys.length < 25) {
    const defaultJourneys = buildDefaultCurriculum();
    for (const journey of defaultJourneys) {
      const existing = await idbGet<Journey>(STORES.JOURNEYS, journey.id);
      if (!existing) {
        journey.maxScore = calculateMaxScore(journey);
        journey.legacyCurriculum = true;
        journey.archived = true;
        await idbPut<Journey>(STORES.JOURNEYS, journey);
      } else {
        if (existing.legacyCurriculum === undefined) {
          existing.legacyCurriculum = true;
          existing.archived = true;
          await idbPut<Journey>(STORES.JOURNEYS, existing);
        }
      }
    }
    await idbPut(STORES.SETTINGS, { key: SEED_KEY, value: SEED_VERSION });
  }
}

export function calculateMaxScore(journey: Journey): number {
  let total = 0;
  for (const stage of journey.stages) {
    for (const act of stage.activities) {
      if (act.score && act.score > 0) {
        total += act.score;
      }
    }
  }
  return total;
}

// ---------------------------------------------------------------------------
// 24 LEARNING TASKS API
// ---------------------------------------------------------------------------
export async function getAllLearningTasks(): Promise<LearningTask[]> {
  await seedDefaultCurriculum();
  const list = await idbGetAll<LearningTask>(STORES.LEARNING_TASKS);
  if (!list || list.length === 0) {
    return buildDefaultLearningTasks();
  }
  return list.sort((a, b) => {
    if (a.grade !== b.grade) return a.grade - b.grade;
    return a.orderInGrade - b.orderInGrade;
  });
}

export async function getLearningTasksByGrade(grade: Grade): Promise<LearningTask[]> {
  const allTasks = await getAllLearningTasks();
  return allTasks.filter(t => t.grade === grade).sort((a, b) => a.orderInGrade - b.orderInGrade);
}

export async function getLearningTaskById(taskId: string): Promise<LearningTask | null> {
  await seedDefaultCurriculum();
  const task = await idbGet<LearningTask>(STORES.LEARNING_TASKS, taskId);
  if (task) return task;
  const all = buildDefaultLearningTasks();
  return all.find(t => t.id === taskId) || null;
}

export async function getTasksByMission(missionId: string): Promise<LearningTask[]> {
  const allTasks = await getAllLearningTasks();
  return allTasks.filter(t => t.missionId === missionId).sort((a, b) => a.orderInMission - b.orderInMission);
}

export async function saveLearningTask(task: LearningTask): Promise<void> {
  await idbPut<LearningTask>(STORES.LEARNING_TASKS, task);
}

// ---------------------------------------------------------------------------
// 10 MISSIONS API
// ---------------------------------------------------------------------------
export async function getAllMissions(): Promise<Mission[]> {
  await seedDefaultCurriculum();
  const list = await idbGetAll<Mission>(STORES.MISSIONS);
  if (!list || list.length === 0) {
    return buildDefaultMissionsWithTasks();
  }
  return list.sort((a, b) => (a.order ?? a.missionNumber ?? 0) - (b.order ?? b.missionNumber ?? 0));
}

export async function getMissionById(id: string): Promise<Mission | null> {
  await seedDefaultCurriculum();
  const mission = await idbGet<Mission>(STORES.MISSIONS, id);
  if (mission) return mission;
  const defaultList = buildDefaultMissionsWithTasks();
  return defaultList.find(m => m.id === id) || null;
}

export async function saveMission(mission: Mission): Promise<void> {
  mission.updatedAt = new Date().toISOString();
  await idbPut<Mission>(STORES.MISSIONS, mission);
}

// ---------------------------------------------------------------------------
// SOURCE STOPS API (Preserved for compatibility and content sourcing)
// ---------------------------------------------------------------------------
export async function getAllStops(): Promise<MissionStop[]> {
  const defaultMissions = buildDefaultMissions();
  const result: MissionStop[] = [];
  for (const m of defaultMissions) {
    if (m.stops) {
      result.push(...m.stops);
    }
  }
  return result;
}

export async function getStopsByGrade(grade: Grade): Promise<MissionStop[]> {
  const allStops = await getAllStops();
  return allStops.filter(
    s => s.primaryGrade === grade || (s.targetGrades && s.targetGrades.includes(grade))
  );
}

export async function getStopsByMission(missionId: string): Promise<MissionStop[]> {
  const allMissions = buildDefaultMissions();
  const m = allMissions.find(item => item.id === missionId);
  return m?.stops || [];
}

export async function getStopById(stopId: string): Promise<MissionStop | null> {
  const allStops = await getAllStops();
  return allStops.find(s => s.id === stopId) || null;
}

// ---------------------------------------------------------------------------
// LEGACY JOURNEYS API & BRIDGING
// ---------------------------------------------------------------------------
export async function getAllJourneys(): Promise<Journey[]> {
  await seedDefaultCurriculum();
  const list = await idbGetAll<Journey>(STORES.JOURNEYS);
  return list.sort((a, b) => {
    if (a.grade !== b.grade) return a.grade - b.grade;
    return a.id.localeCompare(b.id);
  });
}

export async function getJourneysByGrade(grade: number): Promise<Journey[]> {
  const all = await getAllJourneys();
  return all.filter(j => j.grade === grade);
}

export async function getLegacyJourneys(): Promise<Journey[]> {
  const all = await getAllJourneys();
  return all.filter(j => j.legacyCurriculum || j.archived);
}

export async function getJourneyById(id: string): Promise<Journey | null> {
  await seedDefaultCurriculum();

  // If looking for a mission id (e.g. 'm1' ... 'm10'), convert mission with its tasks
  if (id.startsWith('m') && !isNaN(Number(id.replace('m', '')))) {
    const mission = await getMissionById(id);
    if (mission) {
      const tasks = await getAllLearningTasks();
      return convertMissionToJourneySync(mission, tasks);
    }
  }

  // Look in existing journeys store
  const existing = await idbGet<Journey>(STORES.JOURNEYS, id);
  if (existing) return existing;

  // Fallback: check if id matches a mission
  const mission = await getMissionById(id);
  if (mission) {
    const tasks = await getAllLearningTasks();
    return convertMissionToJourneySync(mission, tasks);
  }

  return null;
}

export async function saveJourney(journey: Journey): Promise<void> {
  journey.maxScore = calculateMaxScore(journey);
  journey.updatedAt = new Date().toISOString();
  await idbPut<Journey>(STORES.JOURNEYS, journey);
}

export async function createDraftVersion(journeyId: string): Promise<Journey> {
  const journey = await getJourneyById(journeyId);
  if (!journey) throw new Error('Journey not found');
  journey.status = 'draft';
  journey.version += 1;
  journey.versionId = `${journey.id}-v${journey.version}`;
  journey.updatedAt = new Date().toISOString();
  await saveJourney(journey);
  return journey;
}

export interface PublishValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateJourneyForPublish(journey: Journey): PublishValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!journey.stages || journey.stages.length === 0) {
    errors.push('Hành trình phải có ít nhất 1 nhiệm vụ/chặng học.');
  }

  for (const stage of journey.stages) {
    for (const act of stage.activities) {
      if (!act.prompt || act.prompt.trim() === '') {
        errors.push(`Chặng ${stage.order}: Câu hỏi thử thách không được để trống tiêu đề/yêu cầu.`);
      }
      if (act.score < 0) {
        errors.push(`Chặng ${stage.order}: Điểm số câu hỏi không được âm.`);
      }
      if (act.correctAnswer === undefined || act.correctAnswer === null || act.correctAnswer === '') {
        errors.push(`Chặng ${stage.order}: Hoạt động "${act.prompt.substring(0, 20)}..." chưa thiết lập đáp án đúng.`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export async function publishJourney(id: string): Promise<PublishValidationResult> {
  const journey = await getJourneyById(id);
  if (!journey) {
    throw new Error('Không tìm thấy hành trình');
  }

  const validation = validateJourneyForPublish(journey);
  if (!validation.valid) {
    return validation;
  }

  journey.status = 'published';
  journey.updatedAt = new Date().toISOString();
  await saveJourney(journey);

  return validation;
}
