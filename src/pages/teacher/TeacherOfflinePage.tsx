import React, { useState, useEffect } from 'react';
import { getStorageQuota, getOfflinePackageStatus, removeOfflineCopy } from '../../services/offlineService';
import { getAllJourneys } from '../../services/curriculumService';
import { Journey, OfflinePackageStatus } from '../../types';
import { audioManager } from '../../services/audioService';
import { HardDrive, Download, Trash2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const TeacherOfflinePage: React.FC = () => {
  const [quota, setQuota] = useState<{ usageMb: number; quotaMb: number; usagePercent: number }>({
    usageMb: 45,
    quotaMb: 2048,
    usagePercent: 2,
  });
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [packages, setPackages] = useState<Record<string, OfflinePackageStatus | null>>({});

  useEffect(() => {
    loadOfflineData();
  }, []);

  const loadOfflineData = async () => {
    const q = await getStorageQuota();
    setQuota(q);

    const list = await getAllJourneys();
    setJourneys(list);

    const pkgs: Record<string, OfflinePackageStatus | null> = {};
    for (const j of list) {
      pkgs[j.id] = await getOfflinePackageStatus(j.id);
    }
    setPackages(pkgs);
  };

  const handleRemove = async (journeyId: string, versionId: string) => {
    audioManager.playClick();
    await removeOfflineCopy(journeyId, versionId);
    await loadOfflineData();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <div>
        <h2 className="text-2xl font-black text-slate-800">
          📥 Quản Lý Bộ Nhớ Ngoại Tuyến (Offline Quota)
        </h2>
        <p className="text-xs text-slate-500 font-bold mt-0.5">
          Theo dõi dung lượng cache PWA và các gói học liệu số đã lưu trong thiết bị.
        </p>
      </div>

      {/* Storage Meter Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Bộ nhớ ngoại tuyến thiết bị
              </span>
              <h3 className="text-xl font-black text-slate-800">
                Đã dùng {quota.usageMb} MB / {quota.quotaMb} MB ({quota.usagePercent}%)
              </h3>
            </div>
          </div>

          <button
            onClick={loadOfflineData}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="Làm mới dung lượng"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            style={{ width: `${Math.max(2, quota.usagePercent)}%` }}
            className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full transition-all duration-500"
          />
        </div>
      </div>

      {/* List of Offline Journey Packages */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-slate-800">
          Danh sách gói bài học đã tải về máy
        </h3>

        <div className="space-y-3">
          {journeys.map((j) => {
            const pkg = packages[j.id];
            const isDownloaded = Boolean(pkg?.downloaded);

            return (
              <div
                key={j.id}
                className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{j.icon}</span>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 leading-tight">
                      Lớp {j.grade}: {j.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      {isDownloaded
                        ? `Đã tải: ${pkg?.sizeDisplay || '15 MB'} • Ngày: ${pkg?.downloadDate}`
                        : 'Chưa tải về bộ nhớ ngoại tuyến'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isDownloaded ? (
                    <>
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Sẵn sàng offline</span>
                      </span>

                      <button
                        onClick={() => handleRemove(j.id, j.versionId)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa bản tải</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-slate-400">
                      Chưa tải
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
