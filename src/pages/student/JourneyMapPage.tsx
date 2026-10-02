import React, { useState, useEffect } from 'react';
import { Journey, JourneyProgress, Stage } from '../../types';
import { getJourneyById } from '../../services/curriculumService';
import { getJourneyProgress } from '../../services/progressService';
import { downloadJourneyOffline, getOfflinePackageStatus, removeOfflineCopy } from '../../services/offlineService';
import { audioManager } from '../../services/audioService';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Lock, 
  Play, 
  Download, 
  RotateCcw, 
  Award, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  FileCheck
} from 'lucide-react';

interface JourneyMapPageProps {
  journeyId: string;
  onBackToCity: () => void;
  onSelectStage: (stageId: string) => void;
  onViewCertificate: () => void;
}

export const JourneyMapPage: React.FC<JourneyMapPageProps> = ({
  journeyId,
  onBackToCity,
  onSelectStage,
  onViewCertificate,
}) => {
  const [journey, setJourney] = useState<Journey | null>(null);
  const [progress, setProgress] = useState<JourneyProgress | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatusText, setDownloadStatusText] = useState('');
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [journeyId]);

  const loadData = async () => {
    const j = await getJourneyById(journeyId);
    if (j) setJourney(j);

    const prog = await getJourneyProgress(journeyId);
    setProgress(prog);

    const offlineStatus = await getOfflinePackageStatus(journeyId);
    setIsOfflineReady(offlineStatus?.status === 'ready');
  };

  const handleDownload = async () => {
    if (!journey || downloading) return;
    audioManager.playClick();
    setDownloading(true);
    setDownloadProgress(10);
    setDownloadStatusText('Bắt đầu tải học liệu...');

    try {
      await downloadJourneyOffline(journey, (percent, text) => {
        setDownloadProgress(percent);
        setDownloadStatusText(text);
      });
      setIsOfflineReady(true);
      audioManager.playReward();
    } catch {
      // Handle error
    } finally {
      setTimeout(() => {
        setDownloading(false);
      }, 500);
    }
  };

  const handleStageClick = (stage: Stage) => {
    if (!progress) return;
    const isUnlocked = stage.order === 1 || progress.unlockedStageOrders.includes(stage.order);

    if (!isUnlocked) {
      audioManager.playWrong();
      setLockedNotice(`Chặng ${stage.order} đang khóa. Bạn nhỏ cần hoàn thành Chặng ${stage.order - 1} trước nhé!`);
      setTimeout(() => setLockedNotice(null), 3000);
      return;
    }

    audioManager.playClick();
    onSelectStage(stage.id);
  };

  if (!journey || !progress) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const completedStagesCount = Object.values(progress.stages).filter((s) => s.completed).length;
  const progressPercent = Math.round((completedStagesCount / 7) * 100);

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => {
            audioManager.playClick();
            onBackToCity();
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-sky-50 border-2 border-slate-200 text-slate-700 font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về Bản Đồ Thành Phố</span>
        </button>

        {/* Offline Download Button */}
        <div className="flex items-center gap-2">
          {isOfflineReady ? (
            <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-2xl text-xs font-black shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>✅ SẴN SÀNG OFFLINE</span>
            </div>
          ) : (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-black text-xs shadow-md shadow-sky-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? `Đang tải ${downloadProgress}%` : 'Tải về học Offline'}</span>
            </button>
          )}

          {progress.completed && (
            <>
              <button
                onClick={() => {
                  audioManager.playClick();
                  onSelectStage(journey.stages[0].id);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>🔄 LUYỆN LẠI</span>
              </button>

              <button
                onClick={() => {
                  audioManager.playClick();
                  onViewCertificate();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Chứng nhận</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Download Progress Bar if in progress */}
      {downloading && (
        <div className="bg-sky-50 p-3.5 rounded-2xl border-2 border-sky-200 space-y-1.5 animate-in fade-in duration-150">
          <div className="flex justify-between text-xs font-bold text-sky-800">
            <span>{downloadStatusText}</span>
            <span>{downloadProgress}%</span>
          </div>
          <div className="w-full bg-sky-200 h-2 rounded-full overflow-hidden">
            <div
              style={{ width: `${downloadProgress}%` }}
              className="h-full bg-sky-600 transition-all duration-200"
            />
          </div>
        </div>
      )}

      {/* Locked Stage Toast Warning */}
      {lockedNotice && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs sm:text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <Lock className="w-4 h-4 shrink-0" />
          <span>{lockedNotice}</span>
        </div>
      )}

      {/* Journey Header Card */}
      {(() => {
        const isChang = journey.id.startsWith('m') || Boolean(journey.curriculumVersion?.includes('2026'));
        const changNum = isChang ? Number(journey.id.replace('m', '')) || 1 : null;

        return (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-sky-200 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-400 to-blue-600 text-white flex items-center justify-center text-4xl shadow-lg shadow-sky-500/25 shrink-0">
                {journey.icon}
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">
                  {isChang ? `CHẶNG ${changNum} • ${journey.districtName}` : `Khối Lớp ${journey.grade} • ${journey.districtName}`}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
                  {isChang ? `CHẶNG ${changNum}: ${journey.title}` : journey.title}
                </h1>
                <p className="text-xs sm:text-sm font-bold text-sky-700">
                  🎮 Tên game: {journey.gameTitle}
                </p>
              </div>
            </div>

            {/* Progress summary widget */}
            <div className="bg-sky-50 p-4 rounded-2xl border-2 border-sky-100 text-center shrink-0 w-full sm:w-auto">
              <div className="text-2xl font-black text-sky-800">
                {isChang ? 'Nhiệm Vụ' : 'Chặng'} {progress.currentStageOrder || 1}/{journey.stages.length}
              </div>
              <div className="text-xs font-bold text-slate-500 mb-2">
                Đã hoàn thành {progressPercent}%
              </div>
              <div className="w-32 mx-auto bg-sky-200 h-2.5 rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.max(8, progressPercent)}%` }}
                  className="h-full bg-sky-600 rounded-full"
                />
              </div>
            </div>
          </div>
        );
      })()}

      {/* ADVENTURE PATH */}
      {(() => {
        const isChang = journey.id.startsWith('m') || Boolean(journey.curriculumVersion?.includes('2026'));

        return (
          <div className="bg-gradient-to-b from-sky-50 to-indigo-50/40 rounded-3xl p-6 sm:p-9 border-4 border-sky-200 shadow-lg relative">
            <div className="text-center mb-8">
              <h2 className="text-xl font-black text-slate-800 flex items-center justify-center gap-2">
                <span>🗺️ Tuyến Học Tập Gồm {journey.stages.length} {isChang ? 'Nhiệm Vụ Học Tập' : 'Chặng Thử Thách'}</span>
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                {isChang
                  ? 'Học sinh hoàn thành từng nhiệm vụ theo thứ tự để mở khóa huy hiệu và nhiệm vụ kế tiếp!'
                  : 'Học sinh học theo thứ tự từng chặng. Vượt qua mỗi chặng để mở khóa phần thưởng và chặng kế tiếp!'}
              </p>
            </div>

            <div className="space-y-4 max-w-xl mx-auto relative">
              {/* Vertical connecting line */}
              <div className="absolute top-8 bottom-8 left-7 sm:left-9 w-1 bg-sky-200 -z-0" />

              {journey.stages.map((stage) => {
                const stageProg = progress.stages[stage.id];
                const isStageCompleted = Boolean(stageProg?.completed);
                const isUnlocked = stage.order === 1 || progress.unlockedStageOrders.includes(stage.order);
                const isCurrentActive = isUnlocked && !isStageCompleted;

                let cardClass = 'bg-white border-2 border-slate-200 text-slate-700 opacity-60';
                let circleClass = 'bg-slate-200 text-slate-500 border-2 border-slate-300';

                if (isStageCompleted) {
                  cardClass = 'bg-emerald-50/80 border-2 border-emerald-400 text-emerald-950 shadow-sm';
                  circleClass = 'bg-emerald-500 text-white border-2 border-emerald-600 shadow-md shadow-emerald-500/30';
                } else if (isCurrentActive) {
                  cardClass = 'bg-amber-50 border-3 border-amber-400 text-amber-950 shadow-lg shadow-amber-400/20 scale-[1.02] ring-4 ring-amber-200/50';
                  circleClass = 'bg-amber-400 text-slate-900 border-2 border-amber-500 animate-pulse';
                } else if (isUnlocked) {
                  cardClass = 'bg-white border-2 border-sky-300 text-slate-800 shadow-sm';
                  circleClass = 'bg-sky-500 text-white border-2 border-sky-600';
                }

                return (
                  <div
                    key={stage.id}
                    onClick={() => handleStageClick(stage)}
                    className={`relative z-10 p-4 sm:p-5 rounded-3xl flex items-center justify-between gap-4 transition-all cursor-pointer ${cardClass}`}
                  >
                    {/* Left circle badge */}
                    <div className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black shrink-0 ${circleClass}`}>
                        {isStageCompleted ? (
                          <CheckCircle2 className="w-7 h-7 text-white" />
                        ) : isUnlocked ? (
                          stage.icon
                        ) : (
                          <Lock className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/5">
                            {isChang ? `🎯 Nhiệm vụ ${stage.order}/${journey.stages.length}` : `Chặng ${stage.order}`} {(stage.isFinalStage || stage.order === journey.stages.length) && '• Về Đích 🏆'}
                          </span>
                          {isStageCompleted ? (
                            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                              ✅ Đã chinh phục
                            </span>
                          ) : isCurrentActive ? (
                            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full animate-bounce shadow-xs">
                              ⏳ Đang chinh phục
                            </span>
                          ) : isUnlocked ? (
                            <span className="text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-300">
                              ▶ Sẵn sàng
                            </span>
                          ) : (
                            <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                              🔒 Chưa mở khóa
                            </span>
                          )}
                        </div>
                        <h3 className="font-extrabold text-sm sm:text-base leading-snug mt-1">
                          {stage.title}
                        </h3>

                        {/* 3 Gamified Levels Progress */}
                        {isChang && (
                          <div className="flex items-center gap-1.5 py-1 px-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] font-bold text-slate-600 mt-2 flex-wrap">
                            <span className={isStageCompleted ? 'text-emerald-700 font-extrabold' : isUnlocked ? 'text-slate-800 font-bold' : 'text-slate-400 opacity-50 font-medium'}>
                              🔍 Khám phá {isStageCompleted && '✓'}
                            </span>
                            <span className="text-slate-300 font-bold">→</span>
                            <span className={isStageCompleted ? 'text-emerald-700 font-extrabold' : isCurrentActive ? 'text-slate-800 font-bold' : 'text-slate-400 opacity-50 font-medium'}>
                              🧩 Giải mã {isStageCompleted && '✓'}
                            </span>
                            <span className="text-slate-300 font-bold">→</span>
                            <span className={isStageCompleted ? 'text-emerald-700 font-extrabold' : 'text-slate-400 opacity-50 font-medium'}>
                              🚦 Chinh phục {isStageCompleted && '✓'}
                            </span>
                          </div>
                        )}

                        <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mt-1.5">
                          <span>🎁 Vật phẩm:</span>
                          <span className="font-bold text-amber-700">{stage.reward.name}</span>
                        </p>
                      </div>
                    </div>

                    {/* Right Action */}
                    <div className="shrink-0">
                      {isStageCompleted ? (
                        <span className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black text-xs transition-colors border border-emerald-200 shadow-xs">
                          ÔN TẬP ↺
                        </span>
                      ) : isCurrentActive ? (
                        <span className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-400/30 flex items-center gap-1">
                          <span>TIẾP TỤC ⚡</span>
                        </span>
                      ) : isUnlocked ? (
                        <span className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-black text-xs shadow-md shadow-sky-500/20 flex items-center gap-1">
                          <span>BẮT ĐẦU ▶</span>
                        </span>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-400 text-xs font-bold px-2.5 py-1.5 bg-slate-100 rounded-xl border border-slate-200">
                          <Lock className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">🔒 Chưa mở khóa</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
