import React, { useState, useRef } from 'react';
import { Activity, HotspotArea } from '../../types';
import { Target, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { audioManager } from '../../services/audioService';

interface HotspotProps {
  activity: Activity;
  disabled: boolean;
  onAnswer: (clickedPoint: { xPercent: number; yPercent: number }) => void;
  resultState?: {
    isCorrect: boolean;
    attemptCount: number;
    scoreEarned: number;
  } | null;
}

export const HotspotActivity: React.FC<HotspotProps> = ({
  activity,
  disabled,
  onAnswer,
  resultState,
}) => {
  const [clickedCoord, setClickedCoord] = useState<{ xPercent: number; yPercent: number } | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const xPercent = Math.round((x / rect.width) * 100);
    const yPercent = Math.round((y / rect.height) * 100);

    audioManager.playClick();
    setClickedCoord({ xPercent, yPercent });
  };

  const handleSubmit = () => {
    if (!clickedCoord || disabled) return;
    onAnswer(clickedCoord);
  };

  const isChecked = Boolean(resultState);
  const targetArea: HotspotArea = activity.correctAnswer || {
    xPercent: 30,
    yPercent: 30,
    widthPercent: 40,
    heightPercent: 40,
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold text-slate-500">
        👆 Chạm hoặc bấm vào vùng vị trí an toàn / nguy cơ trên bức tranh:
      </p>

      <div
        ref={imageContainerRef}
        onClick={handleImageClick}
        className="relative w-full aspect-video sm:aspect-16/10 bg-slate-100 rounded-3xl border-4 border-slate-200 overflow-hidden cursor-crosshair select-none shadow-inner"
      >
        {activity.media?.url ? (
          <img
            src={activity.media.url}
            alt="Hotspot challenge"
            className="w-full h-full object-cover pointer-events-none"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-sky-100 to-indigo-100 text-slate-500 p-6 text-center">
            <span className="text-5xl mb-2">🚦</span>
            <p className="font-bold text-sm">Hình minh họa giao thông trực quan</p>
            <p className="text-xs text-slate-400 mt-1">Chạm vào khu vực người đi bộ qua đường</p>
          </div>
        )}

        {/* Selected target point */}
        {clickedCoord && (
          <div
            style={{
              left: `${clickedCoord.xPercent}%`,
              top: `${clickedCoord.yPercent}%`,
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          >
            <div className="w-8 h-8 rounded-full border-3 border-amber-400 bg-amber-400/30 flex items-center justify-center animate-ping" />
            <div className="absolute inset-0 w-8 h-8 rounded-full border-3 border-white bg-amber-500 flex items-center justify-center shadow-lg">
              <Target className="w-4 h-4 text-white" />
            </div>
          </div>
        )}

        {/* Show correct bounding box when checked */}
        {isChecked && (
          <div
            style={{
              left: `${targetArea.xPercent}%`,
              top: `${targetArea.yPercent}%`,
              width: `${targetArea.widthPercent}%`,
              height: `${targetArea.heightPercent}%`,
            }}
            className={`absolute border-3 rounded-2xl pointer-events-none transition-all ${
              resultState?.isCorrect
                ? 'border-emerald-500 bg-emerald-500/20'
                : 'border-rose-500 bg-rose-500/20'
            }`}
          >
            <div className="absolute -top-3 left-2 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
              Vùng mục tiêu đúng
            </div>
          </div>
        )}
      </div>

      {!isChecked && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!clickedCoord || disabled}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-sm bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span>Kiểm tra vị trí đã chọn</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
