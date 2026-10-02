export type Grade = 1 | 2 | 3 | 4 | 5;

export type JourneyStatus = 'draft' | 'ready_for_review' | 'verified' | 'published' | 'archived';

export type StagePhase = 'intro' | 'theory' | 'practice' | 'takeaway' | 'reward' | 'completed';

export type ActivityType = 
  | 'single_choice' 
  | 'multiple_choice' 
  | 'hotspot' 
  | 'drag_drop' 
  | 'sequence' 
  | 'matching' 
  | 'simulation';

export type Difficulty = 'basic' | 'applied' | 'challenge';

// 3 Mức đánh giá chuẩn giáo dục ATGT Tiểu học (Thông tư 27)
export type AssessmentLevel = 1 | 2 | 3; // 1: Nhận biết, 2: Thông hiểu, 3: Vận dụng
export type AssessmentRating = 'T' | 'H' | 'C'; // T: Hoàn thành tốt, H: Hoàn thành, C: Chưa hoàn thành

export interface AssessmentLevelInfo {
  level: AssessmentLevel;
  title: string;
  shortDesc: string;
}

export const ASSESSMENT_LEVELS: Record<AssessmentLevel, AssessmentLevelInfo> = {
  1: { level: 1, title: '🔍 Khám phá — Nhận biết', shortDesc: 'Nhận diện tín hiệu, biển báo, quy tắc giao thông cơ bản' },
  2: { level: 2, title: '🧩 Giải mã — Thông hiểu', shortDesc: 'Giải thích nguyên nhân, phân biệt hành vi an toàn và nguy hiểm' },
  3: { level: 3, title: '🚦 Chinh phục — Vận dụng', shortDesc: 'Xử lý tình huống giao thông thực tế và đưa ra quyết định an toàn' },
};

export const STUDENT_ASSESSMENT_LEVELS: Record<AssessmentLevel, { key: 'recognize' | 'understand' | 'apply'; label: string; icon: string }> = {
  1: { key: 'recognize', label: 'KHÁM PHÁ', icon: '🔍' },
  2: { key: 'understand', label: 'GIẢI MÃ', icon: '🧩' },
  3: { key: 'apply', label: 'CHINH PHỤC', icon: '🚦' },
};

export const ASSESSMENT_RATINGS: Record<AssessmentRating, { label: string; minScorePercent: number; stars: number; badgeColor: string }> = {
  'T': { label: 'Hoàn thành tốt', minScorePercent: 80, stars: 3, badgeColor: 'bg-emerald-500 text-white' },
  'H': { label: 'Hoàn thành', minScorePercent: 50, stars: 2, badgeColor: 'bg-amber-500 text-white' },
  'C': { label: 'Chưa hoàn thành', minScorePercent: 0, stars: 1, badgeColor: 'bg-rose-500 text-white' },
};

export type IntroType = 
  | 'video' 
  | 'audio' 
  | 'image' 
  | 'animation' 
  | 'song' 
  | 'movement' 
  | 'story' 
  | 'none';

export type RewardType = 'item' | 'knowledge_card' | 'badge' | 'stars';

export interface Reward {
  id: string;
  name: string;
  type: RewardType;
  icon: string;
  description: string;
  journeyId: string;
  stageId: string;
  unlockedAt?: string;
  customImage?: string;
}

export interface ActivityOption {
  id: string;
  label: string;
  image?: string;
  isCorrect?: boolean;
}

export interface HotspotArea {
  xPercent: number; // 0 to 100
  yPercent: number; // 0 to 100
  widthPercent: number; // 0 to 100
  heightPercent: number; // 0 to 100
}

export interface MatchingPair {
  id: string;
  leftId: string;
  leftText: string;
  rightId: string;
  rightText: string;
}

export interface Activity {
  id: string;
  stageId: string;
  type: ActivityType;
  difficulty: Difficulty;
  assessmentLevel?: AssessmentLevel; // Mức 1: Nhận biết | Mức 2: Thông hiểu | Mức 3: Vận dụng
  prompt: string;
  media?: {
    type: 'image' | 'video' | 'audio';
    url: string;
    posterUrl?: string;
    alt?: string;
  };
  options?: ActivityOption[];
  correctAnswer: any;
  score: number;
  feedbackCorrect: string;
  feedbackWrong: string;
  ritaHint?: string;
  sourceIds?: string[];
  verified: boolean;
  required: boolean;
}

export interface TheoryContent {
  title: string;
  content: string;
  video?: {
    url: string;
    posterUrl?: string;
    minWatchPercent?: number;
  };
  images?: string[];
  slides?: Array<{
    title: string;
    text: string;
    image?: string;
  }>;
  audio?: string;
  ritaIntro?: string;
  sourceIds: string[];
  verified: boolean;
  requiredBeforePractice: boolean;
  allowedForRita: boolean;
}

export interface StageIntro {
  type: IntroType;
  title: string;
  description?: string;
  mediaUrl?: string;
  durationSeconds?: number;
  required: boolean;
}

export interface Stage {
  id: string;
  journeyId: string;
  order: number; // 1 to 7
  title: string;
  gameTitle?: string;
  icon: string;
  intro: StageIntro;
  theory: TheoryContent;
  activities: Activity[];
  keyTakeaway: string;
  reward: Reward;
  isFinalStage: boolean;
  stopCode?: string;
  targetGrades?: Grade[];
  primaryGrade?: Grade;
  summary?: {
    title: string;
    content: string;
    videoUrl?: string;
    realLifeTask: string;
  };
}

export interface FinalBadge {
  name: string;
  icon: string;
  description: string;
}

export interface StudentStationConfig {
  grade: Grade;
  order: number; // Trạm 1/5...
  areaId: string;
  areaName: string;
  areaIcon: string;
  stationTitle: string; // tên game hóa học sinh thấy
  sourceLessonTitle: string;
  sourceSections: string[];
}

// Model Nhiệm vụ học tập (Learning Task) - Cấu trúc 10 Chặng & 24 Nhiệm Vụ
export interface LearningTask {
  id: string;
  missionId: string;
  grade: Grade;

  orderInGrade: number; // Đánh số riêng theo Cấp (ví dụ Cấp 2: 1/5 .. 5/5)
  orderInMission: number;

  title: string; // Tên game hóa học sinh nhìn thấy

  sourceSections: string[]; // Tên nội dung nguồn (1.1, 1.2, 7.2, 7.3...)

  sourceRecommended: boolean;
  teacherAdded: boolean;

  sourcePeriodCount: number;

  status: 'draft' | 'ready_for_review' | 'verified' | 'published' | 'archived';

  version: string;

  // Thuộc tính học tập & tương tác
  icon?: string;
  gameTitle?: string;
  intro?: StageIntro;
  theory?: TheoryContent;
  activities?: Activity[];
  keyTakeaway?: string;
  reward?: Reward;
  isFinalInMission?: boolean;
}

// Model 10 Chặng (Missions)
export interface Mission {
  id: string; // 'm1' ... 'm10'
  order?: number; // 1 to 10
  missionNumber?: number; // alias for order
  title: string;
  gameTitle?: string;
  icon?: string;
  description?: string;
  districtId?: string;
  districtName?: string;
  learningTaskIds?: string[];
  status?: JourneyStatus;
  curriculumVersion?: string; // "10-mission-2026.1"
  stops?: MissionStop[]; // Các trạm nguồn cũ được lưu trữ làm source nodes
  finalBadge?: FinalBadge;
  maxScore?: number;
  legacyCurriculum?: boolean;
  archived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Model Trạm nguồn cũ (được giữ làm source sections/nodes, KHÔNG xóa dữ liệu)
export interface MissionStop {
  id: string;
  code: string; // e.g. '1.1', '1.2', '1.2b', '1.3', '1.4'
  missionId: string; // 'm1' ... 'm10'
  order: number;
  title: string;
  icon: string;
  districtId: string;
  districtName: string;
  targetGrades: Grade[];
  primaryGrade: Grade;
  intro: StageIntro;
  theory: TheoryContent;
  activities: Activity[];
  keyTakeaway: string;
  reward: Reward;
  isFinalStop?: boolean;
}

export interface Journey {
  id: string;
  grade: Grade;
  title: string;
  gameTitle: string;
  icon: string;
  districtId: string;
  districtName: string;
  status: JourneyStatus;
  version: number;
  versionId: string;
  stages: Stage[];
  finalBadge: FinalBadge;
  summary?: {
    title: string;
    content: string;
    videoUrl?: string;
    realLifeTask: string;
  };
  maxScore: number;
  createdAt: string;
  updatedAt: string;
  legacyCurriculum?: boolean;
  archived?: boolean;
  curriculumVersion?: string;
}

export interface ActivityProgress {
  activityId: string;
  attemptCount: number;
  firstAttemptCorrect: boolean;
  scoreEarned: number;
  scoreFinalized: boolean;
  completed: boolean;
  completedAt?: string;
  assessmentLevel?: AssessmentLevel;
}

export interface StageProgress {
  stageId: string;
  stageOrder: number;
  phase: StagePhase;
  introCompleted: boolean;
  theoryCompleted: boolean;
  activitiesProgress: Record<string, ActivityProgress>;
  completed: boolean;
  completedAt?: string;
  rewardClaimed: boolean;
  score?: number;
  maxScore?: number;
  rating?: AssessmentRating; // 'T' | 'H' | 'C' (3 mức đánh giá)
  ratingText?: string;
}

export interface StopProgress {
  stopId: string;
  stopCode: string;
  missionId: string;
  phase: StagePhase;
  introCompleted: boolean;
  theoryCompleted: boolean;
  activitiesProgress: Record<string, ActivityProgress>;
  completed: boolean;
  completedAt?: string;
  rewardClaimed: boolean;
  score: number;
  maxScore: number;
  rating?: AssessmentRating; // 'T' | 'H' | 'C'
  ratingText?: string;
}

export interface TaskProgress {
  taskId: string;
  missionId: string;
  grade: Grade;
  orderInGrade: number;
  phase: StagePhase;
  introCompleted: boolean;
  theoryCompleted: boolean;
  activitiesProgress: Record<string, ActivityProgress>;
  completed: boolean;
  completedAt?: string;
  rewardClaimed: boolean;
  score: number;
  maxScore: number;
  rating?: AssessmentRating; // 'T' | 'H' | 'C'
  ratingText?: string;
}

export interface MissionProgress {
  missionId: string;
  studentId: string;
  completedStopCodes: string[];
  unlockedStopCodes: string[];
  currentStopCode: string;
  completed: boolean;
  completedAt?: string;
  totalScore: number;
  maxScore: number;
  overallRating?: AssessmentRating;
  completionCelebrated?: boolean;
  certificateCode?: string;
}

export interface JourneyProgress {
  journeyId: string;
  journeyVersionId: string;
  studentId: string;
  stages: Record<string, StageProgress>;
  unlockedStageOrders: number[]; // e.g. [1, 2]
  currentStageOrder: number;
  completed: boolean;
  completedAt?: string;
  totalScore: number;
  cityRewardGranted: boolean;
  completionCelebrated: boolean;
  certificateCode?: string;
  isReplaying?: boolean;
}

export interface StudentProfile {
  localUuid: string;
  nickname: string;
  grade: Grade;
  totalStars: number;
  soundEnabled: boolean;
  avatar: string;
}

export interface KnowledgeCard {
  id: string;
  title: string;
  keyTakeaway: string;
  journeyId: string;
  journeyTitle: string;
  stageId: string;
  stageOrder: number;
  unlockedAt: string;
}

export interface CertificateData {
  certificateCode: string;
  nickname: string;
  grade: Grade;
  journeyId: string;
  journeyTitle: string;
  score: number;
  maxScore: number;
  finalBadge: {
    name: string;
    icon: string;
  };
  completionDate: string;
}

export interface VerifiedKnowledgeChunk {
  id: string;
  sourceId: string;
  journeyId: string;
  stageId: string;
  title: string;
  content: string;
  verified: boolean;
  allowedForRita: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface District {
  id: string;
  name: string;
  icon: string;
  description: string;
  xPercent: number; // 0-100 on map
  yPercent: number; // 0-100 on map
}

export interface OfflinePackageStatus {
  journeyId: string;
  journeyVersionId: string;
  downloaded: boolean;
  downloadDate?: string;
  sizeBytes: number;
  sizeDisplay: string;
  status: 'ready' | 'missing_optional' | 'missing_required' | 'not_downloaded';
  missingAssets: string[];
}

export interface UserRole {
  role: 'student' | 'teacher' | 'admin';
}
