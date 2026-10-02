import React, { useState } from 'react';
import { Activity, ActivityProgress, HotspotArea } from '../../types';
import { SingleChoiceActivity } from './SingleChoiceActivity';
import { MultipleChoiceActivity } from './MultipleChoiceActivity';
import { HotspotActivity } from './HotspotActivity';
import { SequenceActivity } from './SequenceActivity';
import { CheckCircle2, AlertTriangle, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';
import { audioManager } from '../../services/audioService';

interface ActivityRendererProps {
  activity: Activity;
  activityProgress?: ActivityProgress;
  isReplay?: boolean;
  onRecordAttempt: (
    activityId: string,
    isCorrect: boolean,
    score: number
  ) => Promise<{
    activityProgress: ActivityProgress;
    isFirstAttempt: boolean;
    scoreAwardedThisAttempt: number;
  }>;
  onActivityFinished: () => void;
}

export const ActivityRenderer: React.FC<ActivityRendererProps> = ({
  activity,
  activityProgress,
  isReplay = false,
  onRecordAttempt,
  onActivityFinished,
}) => {
  const [resultState, setResultState] = useState<{
    isCorrect: boolean;
    attemptCount: number;
    scoreEarned: number;
  } | null>(() => {
    if (activityProgress?.completed) {
      return {
        isCorrect: true,
        attemptCount: activityProgress.attemptCount,
        scoreEarned: activityProgress.scoreEarned,
      };
    }
    return null;
  });

  const [isRetrying, setIsRetrying] = useState(false);

  const checkAnswerCorrectness = (answer: any): boolean => {
    switch (activity.type) {
      case 'single_choice':
        return String(answer) === String(activity.correctAnswer);

      case 'multiple_choice': {
        const selected = Array.isArray(answer) ? [...answer].sort() : [];
        const correct = Array.isArray(activity.correctAnswer) ? [...activity.correctAnswer].sort() : [];
        return JSON.stringify(selected) === JSON.stringify(correct);
      }

      case 'hotspot': {
        const point = answer as { xPercent: number; yPercent: number };
        const target: HotspotArea = activity.correctAnswer;
        if (!point || !target) return false;
        return (
          point.xPercent >= target.xPercent &&
          point.xPercent <= target.xPercent + target.widthPercent &&
          point.yPercent >= target.yPercent &&
          point.yPercent <= target.yPercent + target.heightPercent
        );
      }

      case 'sequence': {
        const userSeq = Array.isArray(answer) ? answer : [];
        const expectedSeq = Array.isArray(activity.correctAnswer) ? activity.correctAnswer : [];
        return JSON.stringify(userSeq) === JSON.stringify(expectedSeq);
      }

      default:
        return true;
    }
  };

  const handleStudentAnswer = async (answer: any) => {
    const isCorrect = checkAnswerCorrectness(answer);

    if (isCorrect) {
      audioManager.playCorrect();
    } else {
      audioManager.playWrong();
    }

    const res = await onRecordAttempt(activity.id, isCorrect, activity.score);

    setResultState({
      isCorrect,
      attemptCount: res.activityProgress.attemptCount,
      scoreEarned: res.activityProgress.scoreEarned,
    });
    setIsRetrying(false);
  };

  const handleRetry = () => {
    audioManager.playClick();
    setIsRetrying(true);
    setResultState(null);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border-3 border-sky-100 shadow-md space-y-6">
      {/* Activity Header */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {activity.assessmentLevel && (
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-50 text-indigo-900 border border-indigo-200 flex items-center gap-1.5 shadow-xs">
                {activity.assessmentLevel === 1 && '🔍 KHÁM PHÁ'}
                {activity.assessmentLevel === 2 && '🧩 GIẢI MÃ'}
                {activity.assessmentLevel === 3 && '🚦 CHINH PHỤC'}
              </span>
            )}
            <span className="text-xs font-extrabold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              +{activity.score} điểm
            </span>
          </div>
          <h3 className="font-extrabold text-base sm:text-lg text-slate-800 leading-snug">
            {activity.prompt}
          </h3>
        </div>

        {/* Status Badge */}
        {activityProgress?.completed && (
          <div className="flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-bold shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Đã hoàn thành</span>
          </div>
        )}
      </div>

      {/* Render the specific Activity Interactive Component */}
      <div className="min-h-[140px]">
        {activity.type === 'single_choice' && (
          <SingleChoiceActivity
            activity={activity}
            disabled={Boolean(resultState?.isCorrect)}
            onAnswer={handleStudentAnswer}
            resultState={resultState}
          />
        )}

        {activity.type === 'multiple_choice' && (
          <MultipleChoiceActivity
            activity={activity}
            disabled={Boolean(resultState?.isCorrect)}
            onAnswer={handleStudentAnswer}
            resultState={resultState}
          />
        )}

        {activity.type === 'hotspot' && (
          <HotspotActivity
            activity={activity}
            disabled={Boolean(resultState?.isCorrect)}
            onAnswer={handleStudentAnswer}
            resultState={resultState}
          />
        )}

        {activity.type === 'sequence' && (
          <SequenceActivity
            activity={activity}
            disabled={Boolean(resultState?.isCorrect)}
            onAnswer={handleStudentAnswer}
            resultState={resultState}
          />
        )}
      </div>

      {/* Feedback banner after submitting */}
      {resultState && (
        <div
          className={`p-4 sm:p-5 rounded-2xl border-2 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200 ${
            resultState.isCorrect
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-start gap-3">
            {resultState.isCorrect ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className="font-extrabold text-sm sm:text-base">
                {resultState.isCorrect
                  ? 'Tuyệt vời! Bạn đã chọn chính xác!'
                  : 'Chưa chính xác rồi bạn ơi! Đừng nản lòng nhé!'}
              </h4>
              <p className="text-xs sm:text-sm font-semibold mt-1 opacity-90">
                {resultState.isCorrect ? activity.feedbackCorrect : activity.feedbackWrong}
              </p>

              {/* Strict score badge */}
              <div className="mt-2 text-xs font-black">
                {resultState.isCorrect ? (
                  resultState.attemptCount === 1 ? (
                    <span className="text-emerald-700 bg-emerald-200/60 px-2 py-0.5 rounded-md">
                      🎉 Đúng ngay lần đầu: +{resultState.scoreEarned} điểm!
                    </span>
                  ) : (
                    <span className="text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-md">
                      Đã sửa đúng! (0 điểm vì không đúng ngay lần đầu)
                    </span>
                  )
                ) : (
                  <span className="text-rose-700 bg-rose-200/60 px-2 py-0.5 rounded-md">
                    Lần thử thứ {resultState.attemptCount}: 0 điểm
                  </span>
                )}
              </div>

              {/* RITA hint prompt if available */}
              {!resultState.isCorrect && activity.ritaHint && (
                <div className="mt-3 p-3 bg-white/80 rounded-xl border border-rose-200 text-xs text-purple-900 font-bold flex items-start gap-2">
                  <span className="text-base">🤖</span>
                  <div>
                    <span className="text-purple-700 font-black">Gợi ý từ RITA:</span>{' '}
                    <span>{activity.ritaHint}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/50">
            {!resultState.isCorrect ? (
              <button
                onClick={handleRetry}
                className="px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Thử làm lại câu này</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  audioManager.playClick();
                  onActivityFinished();
                }}
                className="px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <span>Tiếp tục thử thách</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
