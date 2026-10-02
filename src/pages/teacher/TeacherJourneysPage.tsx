import React, { useState, useEffect } from 'react';
import { Grade, Journey, Mission, OfflinePackageStatus } from '../../types';
import { getAllJourneys, getAllMissions, publishJourney, validateJourneyForPublish } from '../../services/curriculumService';
import { getOfflinePackageStatus } from '../../services/offlineService';
import { audioManager } from '../../services/audioService';
import { 
  Zap, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  Search, 
  Layers, 
  Archive, 
  Download,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface TeacherJourneysPageProps {
  onNavigateToQuickEditor: (journeyId: string) => void;
  onNavigateToPreview: (journeyId: string) => void;
}

export const TeacherJourneysPage: React.FC<TeacherJourneysPageProps> = ({
  onNavigateToQuickEditor,
  onNavigateToPreview,
}) => {
  const [activeTab, setActiveTab] = useState<'missions' | 'legacy'>('missions');
  const [missions, setMissions] = useState<Mission[]>([]);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [offlineMap, setOfflineMap] = useState<Record<string, OfflinePackageStatus | null>>({});
  const [selectedGrade, setSelectedGrade] = useState<number>(0);
  const [search, setSearchTerm] = useState('');
  const [validationModal, setValidationModal] = useState<{
    journeyTitle: string;
    valid: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const mList = await getAllMissions();
    setMissions(mList);

    const jList = await getAllJourneys();
    setJourneys(jList);

    const offMap: Record<string, OfflinePackageStatus | null> = {};
    for (const j of jList) {
      offMap[j.id] = await getOfflinePackageStatus(j.id);
    }
    setOfflineMap(offMap);
  };

  const handlePublish = async (journey: Journey) => {
    audioManager.playClick();
    const res = validateJourneyForPublish(journey);
    if (!res.valid) {
      setValidationModal({
        journeyTitle: journey.title,
        valid: false,
        errors: res.errors,
        warnings: res.warnings,
      });
      return;
    }

    await publishJourney(journey.id);
    await loadData();
    audioManager.playReward();
    setValidationModal({
      journeyTitle: journey.title,
      valid: true,
      errors: [],
      warnings: res.warnings,
    });
  };

  const filteredMissions = missions.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      (m.gameTitle || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.districtName || '').toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const filteredJourneys = journeys.filter((j) => {
    const matchesGrade = selectedGrade === 0 || j.grade === selectedGrade;
    const matchesSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.gameTitle.toLowerCase().includes(search.toLowerCase()) ||
      j.districtName.toLowerCase().includes(search.toLowerCase());
    return matchesGrade && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-sky-100 text-sky-800 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Teacher Studio • Quản lý học liệu ATGT</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800">
            {activeTab === 'missions' 
              ? '10 Chuyên Đề ATGT Chuẩn (Curriculum Version 10-mission-2026.1)' 
              : '25 Bài Học Lưu Trữ (Legacy Curriculum)'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
            {activeTab === 'missions'
              ? 'Mô hình 10 Chuyên đề với 27 Trạm học tập, phân tuyến khối 1–5 và 3 mức đánh giá (Thông tư 27).'
              : 'Dữ liệu 25 bài học cũ được lưu trữ nguyên vẹn (archived), bảo toàn các chỉnh sửa trước đây.'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0">
          <button
            onClick={() => { audioManager.playClick(); setActiveTab('missions'); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'missions'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>10 Chuyên Đề Mới (27 Trạm)</span>
          </button>
          <button
            onClick={() => { audioManager.playClick(); setActiveTab('legacy'); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'legacy'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>25 Bài Lưu Trữ</span>
          </button>
        </div>
      </div>

      {/* Search & Grade Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-3xl border-2 border-slate-200 shadow-xs">
        {activeTab === 'legacy' ? (
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {[
              { val: 0, label: 'Tất cả (25)' },
              { val: 1, label: 'Lớp 1 (5)' },
              { val: 2, label: 'Lớp 2 (5)' },
              { val: 3, label: 'Lớp 3 (5)' },
              { val: 4, label: 'Lớp 4 (5)' },
              { val: 5, label: 'Lớp 5 (5)' },
            ].map((tab) => (
              <button
                key={tab.val}
                onClick={() => {
                  audioManager.playClick();
                  setSelectedGrade(tab.val);
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                  selectedGrade === tab.val
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 px-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>10 Chuyên Đề Hoạt Động • Đầy đủ 27 Trạm & 3 Mức Đánh Giá</span>
          </div>
        )}

        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm chuyên đề, bài học, tên game..."
            className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-2xl border border-slate-200 focus:outline-hidden focus:border-sky-500"
          />
        </div>
      </div>

      {/* =================================================================== */}
      {/* 10 MISSIONS VIEW */}
      {/* =================================================================== */}
      {activeTab === 'missions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMissions.map((mission) => {
            const isPublished = mission.status === 'published';
            const stops = mission.stops || [];
            const totalActs = stops.reduce((acc, s) => acc + (s.activities?.length || 0), 0);

            return (
              <div
                key={mission.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-xs hover:border-sky-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-2xl shrink-0">
                        {mission.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-black uppercase text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full">
                            Mission {mission.missionNumber || mission.order}
                          </span>
                          <span className="text-[11px] font-bold text-slate-500">
                            {mission.districtName}
                          </span>
                        </div>
                        <h3 className="font-black text-base text-slate-800 leading-snug mt-1">
                          {mission.title}
                        </h3>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Sẵn sàng</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-semibold mt-2 line-clamp-2">
                    {mission.description}
                  </p>

                  {/* Stops Breakdown */}
                  <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                      <span>Các trạm học tập ({stops.length} Trạm • {totalActs} Câu hỏi):</span>
                      <span className="text-sky-700 font-black">Mức 1-2-3</span>
                    </div>
                    <div className="space-y-1">
                      {stops.map(st => (
                        <div key={st.id} className="flex items-center justify-between text-[11px] text-slate-600">
                          <span className="font-semibold truncate max-w-[280px]">
                            <strong className="text-sky-700">Trạm {st.code}:</strong> {st.title}
                          </span>
                          <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-1.5 py-0.2 rounded-md shrink-0">
                            Khối {st.primaryGrade}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-500">
                    🎮 Game: <strong className="text-slate-700">{mission.gameTitle}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        audioManager.playClick();
                        onNavigateToPreview(mission.id);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-sky-300 text-slate-700 font-bold text-xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Xem thử</span>
                    </button>
                    <button
                      onClick={() => {
                        audioManager.playClick();
                        onNavigateToQuickEditor(mission.id);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs shadow-xs cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Soạn nhanh</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =================================================================== */}
      {/* 25 LEGACY JOURNEYS VIEW */}
      {/* =================================================================== */}
      {activeTab === 'legacy' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJourneys.map((journey) => {
            const isPublished = journey.status === 'published';
            const actsCount = journey.stages.reduce((acc, s) => acc + s.activities.length, 0);

            return (
              <div
                key={journey.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl shrink-0">
                        {journey.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-black uppercase text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-full">
                            Lớp {journey.grade}
                          </span>
                          <span className="text-[11px] font-bold text-slate-500">
                            {journey.districtName}
                          </span>
                        </div>
                        <h3 className="font-black text-base text-slate-800 leading-snug mt-1">
                          {journey.title}
                        </h3>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 shrink-0">
                      <span>Lưu trữ (Archived)</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-semibold mt-2">
                    🎮 Game: {journey.gameTitle} • 7 Chặng học • {actsCount} Câu hỏi
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-500">
                    ID: <code className="text-slate-700">{journey.id}</code>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        audioManager.playClick();
                        onNavigateToPreview(journey.id);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-300 text-slate-700 font-bold text-xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Xem thử</span>
                    </button>
                    <button
                      onClick={() => {
                        audioManager.playClick();
                        onNavigateToQuickEditor(journey.id);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-xs cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Soạn nhanh</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Validation Modal */}
      {validationModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border-4 border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-2">
              {validationModal.valid ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
              )}
              <h3 className="text-lg font-black text-slate-800">
                {validationModal.valid ? 'Xuất bản thành công!' : 'Chưa đủ điều kiện xuất bản'}
              </h3>
            </div>

            <p className="text-xs text-slate-600 font-semibold">
              Bài học: <strong className="text-slate-800">{validationModal.journeyTitle}</strong>
            </p>

            {validationModal.errors.length > 0 && (
              <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-200 space-y-1">
                <span className="text-[11px] font-black uppercase text-rose-800 block">Lỗi cần sửa:</span>
                <ul className="text-xs text-rose-700 space-y-0.5 list-disc list-inside">
                  {validationModal.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => setValidationModal(null)}
              className="w-full py-2.5 rounded-2xl bg-slate-800 text-white font-bold text-xs"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
