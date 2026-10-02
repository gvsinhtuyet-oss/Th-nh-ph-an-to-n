import React, { useState } from 'react';
import { Activity, ActivityOption } from '../../types';
import { CheckSquare, Square, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { audioManager } from '../../services/audioService';

interface MultipleChoiceProps {
  activity: Activity;
  disabled: boolean;
  onAnswer: (selectedOptionIds: string[]) => void;
  resultState?: {
    isCorrect: boolean;
    attemptCount: number;
    scoreEarned: number;
  } | null;
}

export const MultipleChoiceActivity: React.FC<MultipleChoiceProps> = ({
  activity,
  disabled,
  onAnswer,
  resultState,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (optionId: string) => {
    if (disabled) return;
    audioManager.playClick();
    setSelectedIds((prev) =>
      prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
    );
  };

  const handleSubmit = () => {
    if (selectedIds.length === 0 || disabled) return;
    onAnswer(selectedIds);
  };

  const isChecked = Boolean(resultState);
  const correctArr: string[] = Array.isArray(activity.correctAnswer) ? activity.correctAnswer : [];

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold text-slate-500 italic">
        💡 Bạn có thể chọn nhiều hơn một đáp án đúng.
      </p>

      <div className="grid grid-cols-1 gap-2.5">
        {activity.options?.map((option: ActivityOption) => {
          const isSelected = selectedIds.includes(option.id);
          const isActuallyCorrect = correctArr.includes(option.id);

          let btnClass = 'bg-white border-2 border-slate-200 text-slate-800 hover:border-sky-300';

          if (isSelected && !isChecked) {
            btnClass = 'bg-sky-50 border-2 border-sky-500 text-sky-900';
          } else if (isChecked) {
            if (isActuallyCorrect && isSelected) {
              btnClass = 'bg-emerald-50 border-2 border-emerald-500 text-emerald-900 font-bold';
            } else if (!isActuallyCorrect && isSelected) {
              btnClass = 'bg-rose-50 border-2 border-rose-400 text-rose-900';
            } else if (isActuallyCorrect && !isSelected) {
              btnClass = 'bg-amber-50 border-2 border-amber-300 text-amber-900 border-dashed';
            }
          }

          return (
            <button
              key={option.id}
              disabled={disabled}
              onClick={() => toggleSelect(option.id)}
              className={`w-full p-4 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer ${btnClass}`}
            >
              <div className="flex items-center gap-3">
                <div className="text-sky-600">
                  {isSelected ? <CheckSquare className="w-5 h-5 text-sky-600" /> : <Square className="w-5 h-5 text-slate-400" />}
                </div>
                <span className="font-bold text-sm sm:text-base leading-snug">
                  {option.label}
                </span>
              </div>

              {isChecked && isActuallyCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
              {isChecked && !isActuallyCorrect && isSelected && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
            </button>
          );
        })}
      </div>

      {!isChecked && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={selectedIds.length === 0 || disabled}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-sm bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span>Xác nhận lựa chọn ({selectedIds.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
