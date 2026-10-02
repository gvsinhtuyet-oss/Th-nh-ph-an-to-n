import React, { useState, useEffect } from 'react';
import { Journey, Stage } from '../../types';
import { getAllJourneys } from '../../services/curriculumService';
import { audioManager } from '../../services/audioService';
import { launchCelebrationFireworks } from '../../utils/fireworks';
import { 
  Laptop, 
  Tablet, 
  Smartphone, 
  RotateCcw, 
  Unlock, 
  Sparkles, 
  Zap, 
  WifiOff, 
  Award,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface PreviewProps {
  initialJourneyId?: string;
  onNavigateToJourney: (id: string) => void;
}

export const TeacherPreviewPage: React.FC<PreviewProps> = ({
  initialJourneyId,
  onNavigateToJourney,
}) => {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [selectedJourneyId, setSelectedJourneyId] = useState<string>(initialJourneyId || 'g2-l2');
  const [deviceFrame, setDeviceFrame] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [testUnlockedAll, setTestUnlockedAll] = useState(false);
  const [testOfflineSimulated, setTestOfflineSimulated] = useState(false);

  useEffect(() => {
    getAllJourneys().then((list) => {
      setJourneys(list);
      if (!initialJourneyId && list.length > 0) {
        setSelectedJourneyId(list[0].id);
      }
    });
  }, [initialJourneyId]);

  const selectedJourney = journeys.find((j) => j.id === selectedJourneyId);

  const handleTestFireworks = () => {
    audioManager.playVictory();
    launchCelebrationFireworks(4000);
  };

  const frameWidthClass =
    deviceFrame === 'desktop'
      ? 'w-full max-w-4xl'
      : deviceFrame === 'tablet'
      ? 'w-[768px]'
      : 'w-[390px]';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">
            👁️ Xem Thử Như Học Sinh & Test Mode
          </h2>
          <p className="text-xs text-slate-500 font-bold mt-0.5">
            Môi trường cách ly thử nghiệm. Mọi thao tác tại đây KHÔNG ghi đè dữ liệu học sinh thật.
          </p>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs self-start">
          <button
            onClick={() => setDeviceFrame('desktop')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors ${
              deviceFrame === 'desktop' ? 'bg-sky-500 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            onClick={() => setDeviceFrame('tablet')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors ${
              deviceFrame === 'tablet' ? 'bg-sky-500 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet</span>
          </button>
          <button
            onClick={() => setDeviceFrame('mobile')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors ${
              deviceFrame === 'mobile' ? 'bg-sky-500 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>
      </div>

      {/* Select Journey */}
      <div className="bg-white p-4 rounded-3xl border-2 border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-700">Chọn bài học xem thử:</span>
          <select
            value={selectedJourneyId}
            onChange={(e) => setSelectedJourneyId(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50"
          >
            {journeys.map((j) => (
              <option key={j.id} value={j.id}>
                Lớp {j.grade} - {j.title} ({j.status})
              </option>
            ))}
          </select>
        </div>

        {/* TEST MODE TOOLBAR */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-1 rounded-xl">
            🧪 Test Mode:
          </span>

          <button
            onClick={() => setTestUnlockedAll(!testUnlockedAll)}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
              testUnlockedAll ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>{testUnlockedAll ? 'Đã mở khóa 7 chặng' : 'Mở khóa tất cả chặng'}</span>
          </button>

          <button
            onClick={handleTestFireworks}
            className="px-3 py-1.5 rounded-xl font-bold text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 flex items-center gap-1 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Bắn pháo hoa</span>
          </button>

          <button
            onClick={() => setTestOfflineSimulated(!testOfflineSimulated)}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
              testOfflineSimulated ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <WifiOff className="w-3.5 h-3.5" />
            <span>{testOfflineSimulated ? 'Đang giả lập Offline' : 'Giả lập Offline'}</span>
          </button>
        </div>
      </div>

      {/* Frame Sandbox */}
      <div className="flex justify-center p-4 bg-slate-200/70 rounded-3xl border-4 border-slate-300 min-h-[600px] overflow-hidden">
        <div
          className={`${frameWidthClass} bg-white rounded-3xl shadow-2xl border-4 border-slate-800 overflow-hidden flex flex-col transition-all duration-300`}
        >
          {/* Mock Student Header inside frame */}
          <div className="bg-sky-600 text-white p-3 flex items-center justify-between text-xs">
            <span className="font-black">🚦 THÀNH PHỐ AN TOÀN (Xem thử)</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold">
              {testOfflineSimulated ? '📴 Offline' : '🟢 Trực tuyến'}
            </span>
          </div>

          {/* Journey Simulation Screen */}
          {selectedJourney && (
            <div className="p-6 space-y-5 flex-1 overflow-y-auto">
              <div className="text-center space-y-1">
                <div className="text-4xl">{selectedJourney.icon}</div>
                <h3 className="text-lg font-black text-slate-800">{selectedJourney.title}</h3>
                <p className="text-xs text-sky-700 font-bold">🎮 {selectedJourney.gameTitle}</p>
              </div>

              {/* 7 Stages simulation cards */}
              <div className="space-y-3">
                {selectedJourney.stages.map((stg) => {
                  const unlocked = testUnlockedAll || stg.order === 1;

                  return (
                    <div
                      key={stg.id}
                      className={`p-3.5 rounded-2xl border-2 flex items-center justify-between ${
                        unlocked ? 'bg-sky-50 border-sky-300' : 'bg-slate-100 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{unlocked ? stg.icon : '🔒'}</span>
                        <div>
                          <p className="text-xs font-black text-slate-800">
                            Chặng {stg.order}: {stg.title}
                          </p>
                          <p className="text-[11px] text-slate-500 font-semibold">
                            {stg.activities.length} Thực hành • Thưởng: {stg.reward.name}
                          </p>
                        </div>
                      </div>

                      {unlocked && (
                        <span className="px-2.5 py-1 rounded-xl bg-sky-500 text-white text-[10px] font-black">
                          Sẵn sàng học
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 text-center">
                <button
                  onClick={() => onNavigateToJourney(selectedJourney.id)}
                  className="px-6 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs shadow-md"
                >
                  Mở trực tiếp trên Student App
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
