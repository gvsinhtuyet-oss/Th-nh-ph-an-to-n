import React from 'react';
import { StageIntro } from '../../types';
import { Play, Music, Sparkles, ArrowRight } from 'lucide-react';
import { audioManager } from '../../services/audioService';

interface StageIntroProps {
  intro: StageIntro;
  onFinishIntro: () => void;
}

export const StageIntroView: React.FC<StageIntroProps> = ({ intro, onFinishIntro }) => {
  const handleProceed = () => {
    audioManager.playClick();
    onFinishIntro();
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-9 border-4 border-sky-200 shadow-xl max-w-2xl mx-auto text-center space-y-6">
      <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/25 animate-bounce">
        {intro.type === 'song' ? '🎵' : intro.type === 'movement' ? '🤸' : '🎬'}
      </div>

      <div className="space-y-2">
        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-800">
          Khởi động chặng học
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-800">
          {intro.title}
        </h2>
        <p className="text-sm font-semibold text-slate-600 max-w-lg mx-auto leading-relaxed">
          {intro.description || 'Cùng RITA khởi động nhẹ nhàng để bắt đầu chuyến phiêu lưu an toàn giao thông nhé!'}
        </p>
      </div>

      {/* Visual Animation / Media placeholder */}
      <div className="w-full aspect-video rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-500 p-6 flex flex-col items-center justify-center text-white shadow-inner relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="text-6xl mb-3 animate-pulse">🤖 🚦 🚸</div>
        <p className="font-extrabold text-sm sm:text-base text-sky-100">
          “Mỗi lựa chọn đúng – Thành phố thêm an toàn”
        </p>
        <div className="mt-4 flex items-center gap-2 bg-white/20 backdrop-blur-xs px-3 py-1.5 rounded-full text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Khởi động khoảng 15 – 30 giây</span>
        </div>
      </div>

      <div>
        <button
          onClick={handleProceed}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-base bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-500/30 flex items-center justify-center gap-2.5 mx-auto transition-all active:scale-95 cursor-pointer"
        >
          <span>Bắt đầu học Lý Thuyết</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
