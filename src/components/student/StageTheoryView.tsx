import React, { useState } from 'react';
import { TheoryContent } from '../../types';
import { BookOpen, CheckCircle, ChevronLeft, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';
import { audioManager } from '../../services/audioService';

interface StageTheoryProps {
  theory: TheoryContent;
  onFinishTheory: () => void;
}

export const StageTheoryView: React.FC<StageTheoryProps> = ({ theory, onFinishTheory }) => {
  const [slideIndex, setSlideIndex] = useState(0);

  const hasSlides = theory.slides && theory.slides.length > 0;
  const currentSlide = hasSlides ? theory.slides![slideIndex] : null;

  const handleComplete = () => {
    audioManager.playReward();
    onFinishTheory();
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-9 border-4 border-emerald-200 shadow-xl max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl text-emerald-600">
            📚
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Lý thuyết trọng tâm
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-800 mt-1">
              {theory.title || 'Kiến thức an toàn cần ghi nhớ'}
            </h2>
          </div>
        </div>

        {theory.verified && (
          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Đã kiểm chứng</span>
          </div>
        )}
      </div>

      {/* Theory Content Body */}
      {hasSlides ? (
        <div className="space-y-4">
          <div className="bg-emerald-50/60 p-6 rounded-2xl border-2 border-emerald-100 min-h-[160px] flex flex-col justify-center">
            <h4 className="font-extrabold text-base text-emerald-900 mb-2">
              {currentSlide?.title}
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed font-semibold">
              {currentSlide?.text}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setSlideIndex(Math.max(0, slideIndex - 1))}
              disabled={slideIndex === 0}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 font-bold text-xs flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Trang trước
            </button>
            <span className="text-xs font-bold text-slate-500">
              Trang {slideIndex + 1} / {theory.slides!.length}
            </span>
            <button
              onClick={() => setSlideIndex(Math.min(theory.slides!.length - 1, slideIndex + 1))}
              disabled={slideIndex === theory.slides!.length - 1}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 font-bold text-xs flex items-center gap-1"
            >
              Trang sau <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-sky-50/60 p-6 rounded-2xl border-2 border-sky-100 leading-relaxed">
          <p className="text-sm sm:text-base text-slate-800 font-semibold whitespace-pre-line">
            {theory.content || 'Hãy quan sát kỹ các biển chỉ dẫn và tín hiệu giao thông xung quanh để đảm bảo an toàn cho chính mình và bạn bè.'}
          </p>
        </div>
      )}

      {/* RITA's Intro thought if present */}
      {theory.ritaIntro && (
        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 flex items-start gap-3 text-xs sm:text-sm text-purple-900">
          <span className="text-2xl">🤖</span>
          <div>
            <span className="font-black text-purple-700 block mb-0.5">Lời nhắn từ RITA:</span>
            <span className="font-semibold">{theory.ritaIntro}</span>
          </div>
        </div>
      )}

      {/* Action Button: "MÌNH ĐÃ HỌC XONG" */}
      <div className="pt-2 text-center">
        <button
          onClick={handleComplete}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-base bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2.5 mx-auto transition-all active:scale-95 cursor-pointer"
        >
          <CheckCircle className="w-5 h-5 text-white" />
          <span>✅ MÌNH ĐÃ HỌC XONG</span>
        </button>
      </div>
    </div>
  );
};
