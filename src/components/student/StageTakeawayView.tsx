import React from 'react';
import { Lightbulb, Gift, Sparkles } from 'lucide-react';
import { audioManager } from '../../services/audioService';

interface StageTakeawayProps {
  takeaway: string;
  onProceedToReward: () => void;
}

export const StageTakeawayView: React.FC<StageTakeawayProps> = ({ takeaway, onProceedToReward }) => {
  const handleProceed = () => {
    audioManager.playReward();
    onProceedToReward();
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-9 border-4 border-amber-300 shadow-xl max-w-xl mx-auto text-center space-y-6 animate-in zoom-in-95 duration-200">
      <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-400 flex items-center justify-center text-4xl shadow-lg shadow-amber-400/30 animate-pulse">
        💡
      </div>

      <div className="space-y-2">
        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
          Ghi nhớ vàng
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-800">
          EM CẦN NHỚ
        </h2>
      </div>

      <div className="bg-amber-50/80 p-6 rounded-2xl border-2 border-amber-200">
        <p className="text-base sm:text-lg font-black text-amber-950 leading-relaxed">
          “{takeaway || 'Mỗi bước chân cẩn thận, mỗi quan sát đúng lúc là một bảo vệ quý giá cho chính em!'}”
        </p>
      </div>

      <div>
        <button
          onClick={handleProceed}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-base bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2.5 mx-auto transition-all active:scale-95 cursor-pointer"
        >
          <Gift className="w-5 h-5" />
          <span>Nhận Phần Thưởng Chặng</span>
        </button>
      </div>
    </div>
  );
};
