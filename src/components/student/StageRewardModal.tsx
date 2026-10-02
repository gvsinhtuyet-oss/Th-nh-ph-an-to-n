import React, { useEffect } from 'react';
import { Reward } from '../../types';
import { Sparkles, Backpack, BookOpen, ArrowRight, Check } from 'lucide-react';
import { audioManager } from '../../services/audioService';

interface StageRewardModalProps {
  reward: Reward;
  nextStageOrder: number | null;
  onContinue: () => void;
}

export const StageRewardModal: React.FC<StageRewardModalProps> = ({
  reward,
  nextStageOrder,
  onContinue,
}) => {
  useEffect(() => {
    audioManager.playReward();
  }, []);

  const isCard = reward.type === 'knowledge_card';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-4 border-amber-300 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            <span>CHẶNG HOÀN THÀNH!</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-800">
            Bạn nhận được:
          </h3>
        </div>

        {/* Item or Card presentation */}
        <div className="bg-gradient-to-tr from-amber-50 to-orange-50 p-6 rounded-3xl border-2 border-amber-200 flex flex-col items-center justify-center space-y-2">
          <div className="w-20 h-20 rounded-2xl bg-white shadow-md flex items-center justify-center text-5xl mb-1 animate-bounce">
            {reward.icon || '🎁'}
          </div>
          <h4 className="text-lg font-black text-slate-800">
            {reward.name}
          </h4>
          <p className="text-xs font-semibold text-slate-500 max-w-xs">
            {reward.description}
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">
            {isCard ? <BookOpen className="w-3.5 h-3.5" /> : <Backpack className="w-3.5 h-3.5" />}
            <span>{isCard ? 'Đã thêm vào Sổ tay an toàn!' : 'Đã thêm vào Ba lô an toàn!'}</span>
          </div>
        </div>

        {/* Next stage notice */}
        {nextStageOrder && nextStageOrder <= 7 && (
          <div className="bg-sky-50 border border-sky-200 p-3 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-sky-800">
            <span className="text-base">🔓</span>
            <span>CHẶNG {nextStageOrder} ĐÃ MỞ!</span>
          </div>
        )}

        <button
          onClick={() => {
            audioManager.playClick();
            onContinue();
          }}
          className="w-full py-3.5 rounded-2xl font-black text-sm sm:text-base bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <span>Tiếp tục cuộc hành trình</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
