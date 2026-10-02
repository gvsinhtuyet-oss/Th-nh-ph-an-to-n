import React, { useState, useEffect } from 'react';
import { Journey, Stage, JourneyProgress, StageProgress, StagePhase, Activity } from '../../types';
import { getJourneyById } from '../../services/curriculumService';
import { 
  getJourneyProgress, 
  getStageProgress, 
  setIntroCompleted, 
  setTheoryCompleted, 
  recordActivityAttempt,
  completeStageTransaction,
  completeJourneyTransaction,
  updateStagePhase,
  isStageAccessible
} from '../../services/progressService';
import { audioManager } from '../../services/audioService';
import { StageIntroView } from '../../components/student/StageIntroView';
import { StageTheoryView } from '../../components/student/StageTheoryView';
import { ActivityRenderer } from '../../components/practice/ActivityRenderer';
import { StageTakeawayView } from '../../components/student/StageTakeawayView';
import { StageRewardModal } from '../../components/student/StageRewardModal';
import { StageFinalCelebration } from '../../components/student/StageFinalCelebration';
import { RitaAssistant } from '../../components/student/RitaAssistant';
import { ArrowLeft, BookOpen, CheckCircle2, ChevronRight, Lock, Award, Sparkles, HelpCircle } from 'lucide-react';

interface StageLearningPageProps {
  journeyId: string;
  stageId: string;
  isReplay?: boolean;
  onBackToJourneyMap: () => void;
  onGoToNextStage: (nextStageId: string) => void;
  onViewCertificate: () => void;
}

export const StageLearningPage: React.FC<StageLearningPageProps> = ({
  journeyId,
  stageId,
  isReplay = false,
  onBackToJourneyMap,
  onGoToNextStage,
  onViewCertificate,
}) => {
  const [journey, setJourney] = useState<Journey | null>(null);
  const [stage, setStage] = useState<Stage | null>(null);
  const [journeyProgress, setJourneyProgress] = useState<JourneyProgress | null>(null);
  const [stageProgress, setStageProgress] = useState<StageProgress | null>(null);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);

  const [showRewardModal, setShowRewardModal] = useState(false);
  const [nextUnlockedOrder, setNextUnlockedOrder] = useState<number | null>(null);
  const [finalCompletedData, setFinalCompletedData] = useState<{
    firstTimeCompleted: boolean;
    certificateCode: string;
  } | null>(null);

  const [routeGuardFailed, setRouteGuardFailed] = useState(false);

  useEffect(() => {
    loadStage();
  }, [journeyId, stageId]);

  const loadStage = async () => {
    const j = await getJourneyById(journeyId);
    if (!j) {
      onBackToJourneyMap();
      return;
    }
    setJourney(j);

    const s = j.stages.find((item) => item.id === stageId);
    if (!s) {
      onBackToJourneyMap();
      return;
    }
    setStage(s);

    const jProg = await getJourneyProgress(journeyId);
    setJourneyProgress(jProg);

    // ROUTE GUARD: Check if Stage is accessible
    const accessible = isStageAccessible(jProg.unlockedStageOrders, s.order);
    if (!accessible && !isReplay) {
      setRouteGuardFailed(true);
      setTimeout(() => {
        onBackToJourneyMap();
      }, 1500);
      return;
    }

    const sProg = await getStageProgress(journeyId, s);
    setStageProgress(sProg);

    if (sProg.phase === 'reward' && !sProg.completed) {
      setShowRewardModal(true);
    }

    // If stage was already completed previously, we can allow free viewing
    if (s.order === 7 && sProg.completed) {
      setFinalCompletedData({
        firstTimeCompleted: false,
        certificateCode: jProg.certificateCode || 'TPAT-CERT',
      });
    }
  };

  if (routeGuardFailed) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-3xl">
          🔒
        </div>
        <h2 className="text-xl font-black text-rose-800">
          Chặng này chưa được mở khóa!
        </h2>
        <p className="text-sm text-slate-600">
          Đang chuyển hướng bạn trở về bản đồ hành trình...
        </p>
      </div>
    );
  }

  if (!journey || !stage || !stageProgress || !journeyProgress) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Handle Finishing Intro
  const handleFinishIntro = async () => {
    const updated = await setIntroCompleted(journey.id, stage.id);
    setStageProgress({ ...updated });
  };

  // Handle Finishing Theory
  const handleFinishTheory = async () => {
    const updated = await setTheoryCompleted(journey.id, stage.id);
    setStageProgress({ ...updated });
  };

  // Handle Recording Practice Attempt
  const handleRecordAttempt = async (activityId: string, isCorrect: boolean, score: number) => {
    return recordActivityAttempt(journey.id, stage.id, activityId, isCorrect, score, isReplay);
  };

  // Handle Activity finished
  const handleActivityFinished = async () => {
    const activities = stage.activities || [];
    if (currentActivityIndex < activities.length - 1) {
      setCurrentActivityIndex(currentActivityIndex + 1);
    } else {
      // All activities finished -> Move to Takeaway phase
      const updatedJProg = await updateStagePhase(journey.id, stage.id, 'takeaway');
      setStageProgress({ ...updatedJProg.stages[stage.id] });
    }
  };

  // Handle Proceed to Reward from Takeaway
  const handleProceedToReward = async () => {
    const isLast = stage.isFinalStage || stage.order === journey.stages.length;
    if (isLast) {
      // Complete Stage and Journey Transaction
      await completeStageTransaction(journey, stage, isReplay);
      const finalRes = await completeJourneyTransaction(journey, isReplay);
      setFinalCompletedData(finalRes);

      const updatedJProg = await updateStagePhase(journey.id, stage.id, 'completed');
      setStageProgress({ ...updatedJProg.stages[stage.id] });
      return;
    }

    // Intermediate Stages/Stops
    const res = await completeStageTransaction(journey, stage, isReplay);
    setNextUnlockedOrder(res.nextStageOrderUnlocked);

    const updatedJProg = await updateStagePhase(journey.id, stage.id, 'reward');
    setStageProgress({ ...updatedJProg.stages[stage.id] });
    setShowRewardModal(true);
  };

  // Handle Reward Modal Continue
  const handleRewardModalContinue = async () => {
    setShowRewardModal(false);
    await updateStagePhase(journey.id, stage.id, 'completed');
    // Find next stage
    const nextOrder = stage.order + 1;
    const nextStage = journey.stages.find((s) => s.order === nextOrder);
    if (nextStage) {
      onGoToNextStage(nextStage.id);
    } else {
      onBackToJourneyMap();
    }
  };

  const currentActivity: Activity | undefined = stage.activities[currentActivityIndex];
  const currentActProgress = currentActivity ? stageProgress.activitiesProgress[currentActivity.id] : undefined;

  return (
    <div className="space-y-6 pb-20 max-w-4xl mx-auto">
      {/* Top Header Breadcrumb & Stage Indicators */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-3 border-sky-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              audioManager.playClick();
              onBackToJourneyMap();
            }}
            className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-sky-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            {(() => {
              const isChang = journey.id.startsWith('m') || Boolean(journey.curriculumVersion?.includes('2026'));
              const changNum = isChang ? Number(journey.id.replace('m', '')) || 1 : null;

              return (
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-black uppercase tracking-wider text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full">
                      {isChang ? `🎯 Nhiệm Vụ ${stage.order}/${journey.stages.length}` : `Chặng ${stage.order}/${journey.stages.length}`}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {isChang ? `CHẶNG ${changNum}: ${journey.title}` : journey.title}
                    </span>
                  </div>
                  <h1 className="text-base sm:text-lg font-black text-slate-800 leading-snug mt-0.5">
                    {stage.title}
                  </h1>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Phase Pill Indicators (🔍 Khám phá → 🧩 Giải mã → 🚦 Chinh phục) */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto text-[11px] font-extrabold text-slate-600 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
          <span className={`px-2.5 py-1 rounded-xl flex items-center gap-1 ${
            stageProgress.introCompleted ? 'bg-emerald-100 text-emerald-800' : stageProgress.phase === 'intro' ? 'bg-amber-400 text-slate-900 shadow-xs' : 'text-slate-400'
          }`}>
            <span>🔍 Khám phá</span>
            {stageProgress.introCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
          </span>

          <span className={`px-2.5 py-1 rounded-xl flex items-center gap-1 ${
            stageProgress.theoryCompleted ? 'bg-emerald-100 text-emerald-800' : stageProgress.phase === 'theory' ? 'bg-amber-400 text-slate-900 shadow-xs' : 'text-slate-400'
          }`}>
            <span>🧩 Giải mã</span>
            {stageProgress.theoryCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
          </span>

          <span className={`px-2.5 py-1 rounded-xl flex items-center gap-1 ${
            stageProgress.completed ? 'bg-emerald-100 text-emerald-800' : stageProgress.phase === 'practice' ? 'bg-amber-400 text-slate-900 shadow-xs' : 'text-slate-400'
          }`}>
            <span>🚦 Chinh phục ({stage.activities.length > 0 ? `${currentActivityIndex + 1}/${stage.activities.length}` : '0'})</span>
            {stageProgress.completed && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
          </span>
        </div>
      </div>

      {/* Main Content Area based on Stage Phase */}
      <div className="transition-all">
        {/* Phase 1: Intro */}
        {stageProgress.phase === 'intro' && (
          <StageIntroView intro={stage.intro} onFinishIntro={handleFinishIntro} />
        )}

        {/* Phase 2: Theory */}
        {stageProgress.phase === 'theory' && (
          <StageTheoryView theory={stage.theory} onFinishTheory={handleFinishTheory} />
        )}

        {/* Phase 3: Practice */}
        {stageProgress.phase === 'practice' && (
          <div className="space-y-4">
            {stage.activities.length > 0 && currentActivity ? (
              <ActivityRenderer
                key={currentActivity.id}
                activity={currentActivity}
                activityProgress={currentActProgress}
                isReplay={isReplay}
                onRecordAttempt={handleRecordAttempt}
                onActivityFinished={handleActivityFinished}
              />
            ) : (
              <div className="bg-white rounded-3xl p-8 border-3 border-sky-100 text-center space-y-4">
                <span className="text-4xl">🌱</span>
                <h3 className="text-lg font-black text-slate-800">
                  Chặng học này đang được chuẩn bị thêm câu hỏi thực hành
                </h3>
                <p className="text-xs text-slate-500">
                  Em có thể ghi nhớ nội dung lý thuyết và tiến thẳng đến phần nhận thưởng chặng!
                </p>
                <button
                  onClick={handleActivityFinished}
                  className="px-6 py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black text-sm shadow-md shadow-sky-500/25"
                >
                  Tiếp tục nhận ghi nhớ vàng
                </button>
              </div>
            )}
          </div>
        )}

        {/* Phase 4: Key Takeaway */}
        {stageProgress.phase === 'takeaway' && (
          <StageTakeawayView
            takeaway={stage.keyTakeaway}
            onProceedToReward={handleProceedToReward}
          />
        )}

        {/* Phase 5: Final Stage Celebration */}
        {(stageProgress.phase === 'completed' && (stage.isFinalStage || stage.order === journey.stages.length)) && finalCompletedData && (
          <StageFinalCelebration
            journey={journey}
            progress={journeyProgress}
            certificateCode={finalCompletedData.certificateCode}
            isFirstTimeCompleted={finalCompletedData.firstTimeCompleted}
            onViewCertificate={onViewCertificate}
            onReplay={() => onGoToNextStage(journey.stages[0].id)}
            onBackToCity={onBackToJourneyMap}
          />
        )}

        {/* Intermediate Stages/Stops Completed Review */}
        {stageProgress.phase === 'completed' && !(stage.isFinalStage || stage.order === journey.stages.length) && (
          <div className="bg-white rounded-3xl p-8 border-4 border-emerald-300 shadow-xl max-w-xl mx-auto text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-4xl shadow-inner">
              {stageProgress.rating === 'T' ? '🌟' : stageProgress.rating === 'H' ? '👍' : '✅'}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 bg-emerald-100 text-emerald-800">
                <span>{journey.id.startsWith('m') ? `🎯 Nhiệm Vụ ${stage.order}` : `Chặng ${stage.order}`}</span>
                <span>•</span>
                <span>✅ Đã Chinh Phục</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-800">
                {stage.title}
              </h3>
            </div>

            {/* Gamified progress result */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
                Kết quả chinh phục
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-black ${
                  stageProgress.rating === 'T'
                    ? 'bg-emerald-500 text-white'
                    : stageProgress.rating === 'H'
                    ? 'bg-amber-500 text-white'
                    : 'bg-rose-500 text-white'
                }`}>
                  {stageProgress.rating === 'T' ? '🌟🌟🌟 Xuất sắc' : stageProgress.rating === 'H' ? '🌟🌟 Đạt chuẩn' : '🌟 Cần rèn luyện thêm'}
                </span>
                <span className="text-xs font-bold text-slate-600">
                  ({stageProgress.score || 0}/{stageProgress.maxScore || 30} điểm)
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500">
                {stageProgress.rating === 'T'
                  ? 'Tuyệt vời! Em nắm vững kiến thức và kỹ năng xử lý an toàn giao thông!'
                  : stageProgress.rating === 'H'
                  ? 'Rất tốt! Em đã hoàn thành xuất sắc các thử thách chính của bài học.'
                  : 'Em đã hoàn thành thử thách, hãy ôn lại kiến thức để đạt kết quả cao hơn nhé!'}
              </p>
            </div>

            <div className="pt-2 flex gap-3 justify-center flex-wrap">
              <button
                onClick={onBackToJourneyMap}
                className="px-5 py-3 rounded-2xl font-black text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                Về lộ trình học tập
              </button>
              <button
                onClick={() => {
                  const nextOrder = stage.order + 1;
                  const next = journey.stages.find((s) => s.order === nextOrder);
                  if (next) onGoToNextStage(next.id);
                  else onBackToJourneyMap();
                }}
                className="px-6 py-3 rounded-2xl font-black text-xs sm:text-sm bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/25 cursor-pointer"
              >
                Sang nhiệm vụ tiếp theo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reward Popup Modal for Stages 1-6 */}
      {showRewardModal && (
        <StageRewardModal
          reward={stage.reward}
          nextStageOrder={nextUnlockedOrder}
          onContinue={handleRewardModalContinue}
        />
      )}

      {/* RITA AI Assistant Widget */}
      <RitaAssistant
        grade={journey.grade}
        journeyTitle={journey.title}
        stageTitle={stage.title}
        activityPrompt={currentActivity?.prompt}
        activityCompleted={Boolean(currentActProgress?.completed)}
        attemptCount={currentActProgress?.attemptCount || 0}
        ritaOfflineHint={currentActivity?.ritaHint}
      />
    </div>
  );
};
