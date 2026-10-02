import React, { useState } from 'react';
import { Activity, ActivityOption } from '../../types';
import { ArrowUp, ArrowDown, GripVertical, CheckCircle2, ArrowRight } from 'lucide-react';
import { audioManager } from '../../services/audioService';

interface SequenceProps {
  activity: Activity;
  disabled: boolean;
  onAnswer: (orderedIds: string[]) => void;
  resultState?: {
    isCorrect: boolean;
    attemptCount: number;
    scoreEarned: number;
  } | null;
}

export const SequenceActivity: React.FC<SequenceProps> = ({
  activity,
  disabled,
  onAnswer,
  resultState,
}) => {
  // Initial shuffle or list
  const [items, setItems] = useState<ActivityOption[]>(() => {
    const list = [...(activity.options || [])];
    return list;
  });

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (disabled) return;
    audioManager.playClick();
    const newItems = [...items];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    setItems(newItems);
  };

  const handleSubmit = () => {
    if (disabled) return;
    const orderedIds = items.map((i) => i.id);
    onAnswer(orderedIds);
  };

  const isChecked = Boolean(resultState);

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold text-slate-500">
        🔢 Bấm mũi tên ⬆️ hoặc ⬇️ để di chuyển sắp xếp các bước theo đúng trình tự an toàn:
      </p>

      <div className="space-y-2.5">
        {items.map((item, idx) => {
          let cardBorder = 'border-slate-200 bg-white';
          if (isChecked) {
            const expectedId = activity.correctAnswer[idx];
            cardBorder = item.id === expectedId ? 'border-emerald-500 bg-emerald-50' : 'border-rose-300 bg-rose-50';
          }

          return (
            <div
              key={item.id}
              className={`p-3.5 sm:p-4 rounded-2xl border-2 flex items-center justify-between gap-3 shadow-xs transition-all ${cardBorder}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 font-black text-sm flex items-center justify-center shrink-0">
                  {idx + 1}
                </div>
                <span className="font-bold text-sm sm:text-base text-slate-800">
                  {item.label}
                </span>
              </div>

              {!disabled && !isChecked && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveItem(idx, 'up')}
                    disabled={idx === 0}
                    className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-sky-100 disabled:opacity-30 text-slate-700 flex items-center justify-center transition-colors"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(idx, 'down')}
                    disabled={idx === items.length - 1}
                    className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-sky-100 disabled:opacity-30 text-slate-700 flex items-center justify-center transition-colors"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isChecked && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={disabled}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-sm bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span>Kiểm tra thứ tự các bước</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
