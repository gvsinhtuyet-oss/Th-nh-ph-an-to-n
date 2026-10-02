import React, { useState } from 'react';
import { Activity, ActivityOption } from '../../types';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { audioManager } from '../../services/audioService';

interface SingleChoiceProps {
  activity: Activity;
  disabled: boolean;
  onAnswer: (selectedOptionId: string) => void;
  resultState?: {
    isCorrect: boolean;
    attemptCount: number;
    scoreEarned: number;
  } | null;
}

export const SingleChoiceActivity: React.FC<SingleChoiceProps> = ({
  activity,
  disabled,
  onAnswer,
  resultState,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (optionId: string) => {
    if (disabled) return;
    audioManager.playClick();
    setSelectedId(optionId);
  };

  const handleSubmit = () => {
    if (!selectedId || disabled) return;
    onAnswer(selectedId);
  };

  const isChecked = Boolean(resultState);

  return (
    <div className="space-y-4">
      {/* Options list */}
      <div className="grid grid-cols-1 gap-2.5">
        {activity.options?.map((option: ActivityOption, index: number) => {
          const isSelected = selectedId === option.id;
          const isTheCorrectOne = isChecked && option.id === activity.correctAnswer;
          const isChosenWrong = isChecked && isSelected && !resultState?.isCorrect;

          let btnClass = 'bg-white border-2 border-slate-200 text-slate-800 hover:border-sky-300 hover:bg-sky-50/50';

          if (isSelected && !isChecked) {
            btnClass = 'bg-sky-50 border-2 border-sky-500 text-sky-900 shadow-sm';
          } else if (isTheCorrectOne) {
            btnClass = 'bg-emerald-50 border-2 border-emerald-500 text-emerald-900 font-bold';
          } else if (isChosenWrong) {
            btnClass = 'bg-rose-50 border-2 border-rose-400 text-rose-900';
          }

          return (
            <button
              key={option.id}
              disabled={disabled}
              onClick={() => handleSelect(option.id)}
              className={`w-full p-4 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer ${btnClass}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-slate-100 font-black text-xs text-slate-600 flex items-center justify-center shrink-0">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="font-bold text-sm sm:text-base leading-snug">
                  {option.label}
                </span>
              </div>

              {isTheCorrectOne && <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 ml-2" />}
              {isChosenWrong && <XCircle className="w-6 h-6 text-rose-600 shrink-0 ml-2" />}
            </button>
          );
        })}
      </div>

      {/* Submit button */}
      {!isChecked && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!selectedId || disabled}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-sm bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span>Xác nhận câu trả lời</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
