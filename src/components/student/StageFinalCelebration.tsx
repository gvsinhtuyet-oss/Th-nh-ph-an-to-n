import React, { useEffect, useState } from 'react';
import { Journey, JourneyProgress } from '../../types';
import { Award, Sparkles, MapPin, Printer, RotateCcw, ArrowRight } from 'lucide-react';
import { audioManager } from '../../services/audioService';
import { launchCelebrationFireworks } from '../../utils/fireworks';

interface FinalCelebrationProps {
  journey: Journey;
  progress: JourneyProgress;
  certificateCode: string;
  isFirstTimeCompleted: boolean;
  onViewCertificate: () => void;
  onReplay: () => void;
  onBackToCity: () => void;
}

export const StageFinalCelebration: React.FC<FinalCelebrationProps> = ({
  journey,
  progress,
  certificateCode,
  isFirstTimeCompleted,
  onViewCertificate,
  onReplay,
  onBackToCity,
}) => {
  const [cityRestored, setCityRestored] = useState(false);

  useEffect(() => {
    audioManager.playVictory();

    // Trigger fireworks only on first-time completion
    if (isFirstTimeCompleted) {
      launchCelebrationFireworks(4500);
    }

    const timer = setTimeout(() => {
      setCityRestored(true);
    }, 800);

    return () => clearTimeout(timer);
  }, [isFirstTimeCompleted]);

  const handleManualFireworks = () => {
    audioManager.playVictory();
    launchCelebrationFireworks(4000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-9 border-4 border-amber-400 shadow-2xl max-w-2xl mx-auto text-center space-y-7 animate-in zoom-in-95 duration-200">
      {/* Badge Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 border border-amber-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
          <span>XUẤT SẮC HOÀN THÀNH TOÀN BỘ HÀNH TRÌNH!</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
          Chúc Mừng Bạn Nhỏ Dũng Cảm!
        </h2>
        <p className="text-sm font-semibold text-slate-600">
          Em đã chinh phục trọn vẹn 7 chặng thử thách của bài học: <br />
          <strong className="text-sky-700">“{journey.title}”</strong>
        </p>
      </div>

      {/* Final Badge Award Card */}
      <div className="bg-gradient-to-tr from-amber-100 via-orange-50 to-yellow-100 p-6 rounded-3xl border-3 border-amber-300 flex flex-col items-center justify-center space-y-3 shadow-md">
        <div className="w-24 h-24 rounded-3xl bg-white shadow-xl flex items-center justify-center text-6xl border-4 border-amber-200 animate-bounce">
          {journey.finalBadge?.icon || '🏅'}
        </div>
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/70 px-2.5 py-0.5 rounded-full">
            Huy Hiệu Danh Dự
          </span>
          <h3 className="text-xl font-black text-slate-900 mt-1">
            {journey.finalBadge?.name || 'Chiến Binh An Toàn'}
          </h3>
          <p className="text-xs font-bold text-slate-600 max-w-sm mt-1">
            {journey.finalBadge?.description}
          </p>
        </div>
      </div>

      {/* City Restore Animation Box */}
      <div className="bg-slate-50 p-5 rounded-3xl border-2 border-slate-200 text-left space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏙️</span>
            <div>
              <h4 className="font-extrabold text-sm text-slate-800">
                Khôi phục khu vực: {journey.districtName}
              </h4>
              <p className="text-xs text-slate-500 font-semibold">
                Thành phố An Toàn sáng rực thêm một góc phố bình yên!
              </p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-black transition-all ${
            cityRestored ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {cityRestored ? '🟢 ĐÃ AN TOÀN' : '🟡 ĐANG KHÔI PHỤC'}
          </span>
        </div>

        <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-1000 ${
              cityRestored ? 'w-full' : 'w-1/3'
            }`}
          />
        </div>
      </div>

      {/* Real life task */}
      <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 text-xs sm:text-sm text-sky-950 font-bold flex items-start gap-3 text-left">
        <span className="text-2xl shrink-0">🤝</span>
        <div>
          <span className="text-sky-800 block uppercase tracking-wider text-[11px] font-black">
            Nhiệm vụ thực tế hàng ngày:
          </span>
          <p className="font-semibold text-slate-700 mt-0.5">
            {journey.summary?.realLifeTask || 'Cùng cha mẹ nhắc nhở nhau đội mũ bảo hiểm và quan sát cẩn thận mỗi khi qua đường.'}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          onClick={onViewCertificate}
          className="py-3.5 px-4 rounded-2xl font-black text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <Award className="w-4 h-4" />
          <span>🎓 NHẬN CHỨNG NHẬN</span>
        </button>

        <button
          onClick={handleManualFireworks}
          className="py-3.5 px-4 rounded-2xl font-black text-sm bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <span>🎉 Xem lại chúc mừng</span>
        </button>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold text-slate-500">
        <button
          onClick={onReplay}
          className="hover:text-sky-600 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>🔄 LUYỆN LẠI</span>
        </button>

        <button
          onClick={onBackToCity}
          className="hover:text-sky-600 flex items-center gap-1.5 transition-colors cursor-pointer font-black text-sky-700"
        >
          <span>Về Bản Đồ Thành Phố</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
