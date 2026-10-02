import React, { useState, useEffect } from 'react';
import { Grade, Mission, LearningTask, JourneyProgress } from '../../types';
import { 
  getAllMissions, 
  getAllLearningTasks, 
  getLearningTasksByGrade 
} from '../../services/curriculumService';
import { getStudentStations, StudentStationConfig } from '../../data/studentStations';
import { getJourneyProgress } from '../../services/progressService';
import { getStudentProfile, updateStudentProfile } from '../../services/profileService';
import { audioManager } from '../../services/audioService';
import { 
  Sparkles, 
  ChevronRight, 
  Play, 
  Lock, 
  CheckCircle2, 
  Compass, 
  Layers, 
  Award,
  Zap,
  RotateCcw
} from 'lucide-react';

interface CityMapPageProps {
  onSelectJourney: (journeyId: string) => void;
}

type ViewMode = 'grade_track' | 'all_changs';

export const CityMapPage: React.FC<CityMapPageProps> = ({ onSelectJourney }) => {
  const [selectedGrade, setSelectedGrade] = useState<Grade>(1);
  const [viewMode, setViewMode] = useState<ViewMode>('grade_track');
  const [missions, setMissions] = useState<Mission[]>([]);
  const [gradeTasks, setGradeTasks] = useState<LearningTask[]>([]);
  const [allTasks, setAllTasks] = useState<LearningTask[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, JourneyProgress>>({});
  const [stations, setStations] = useState<StudentStationConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentProfile().then((p) => {
      if (p.grade) setSelectedGrade(p.grade);
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedGrade, viewMode]);

  const loadData = async () => {
    setLoading(true);
    const [allM, gTasks, totalTasks] = await Promise.all([
      getAllMissions(),
      getLearningTasksByGrade(selectedGrade),
      getAllLearningTasks(),
    ]);

    setMissions(allM);
    setGradeTasks(gTasks);
    setAllTasks(totalTasks);
    setStations(getStudentStations(selectedGrade));

    // Load progress for missions
    const progRecord: Record<string, JourneyProgress> = {};
    for (const m of allM) {
      progRecord[m.id] = await getJourneyProgress(m.id);
    }
    setProgressMap(progRecord);
    setLoading(false);
  };

  const handleGradeChange = async (grade: Grade) => {
    audioManager.playClick();
    setSelectedGrade(grade);
    await updateStudentProfile({ grade });
  };

  const handleOpenChang = (missionId: string) => {
    audioManager.playClick();
    onSelectJourney(missionId);
  };

  const handleOpenTask = (missionId: string, taskId: string) => {
    audioManager.playClick();
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `/journey/${missionId}/stage/${taskId}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  // Group gradeTasks by Mission (Chặng)
  const activeChangs: Array<{
    mission: Mission;
    areaName?: string;
    areaIcon?: string;
    tasks: Array<{ task: LearningTask; indexInGrade: number; stationConfig?: StudentStationConfig }>;
  }> = [];

  for (let i = 0; i < gradeTasks.length; i++) {
    const task = gradeTasks[i];
    const indexInGrade = i + 1; // 1 to totalInGrade (e.g. 1/5 .. 5/5)
    const stationConfig = stations.find((s) => s.order === indexInGrade) || stations[i];
    let group = activeChangs.find((g) => g.mission.id === task.missionId);
    if (!group) {
      const m = missions.find((item) => item.id === task.missionId) || {
        id: task.missionId,
        order: Number(task.missionId.replace('m', '')) || 1,
        title: `Chặng ${task.missionId.replace('m', '')}`,
        gameTitle: '',
        icon: task.icon || '🚦',
        districtName: '',
        learningTaskIds: [],
      };
      group = { 
        mission: m, 
        areaName: stationConfig?.areaName, 
        areaIcon: stationConfig?.areaIcon, 
        tasks: [] 
      };
      activeChangs.push(group);
    }
    group.tasks.push({ task, indexInGrade, stationConfig });
  }

  // Count completed tasks for current Cấp
  const completedInGrade = gradeTasks.filter((t) => {
    return Boolean(progressMap[t.missionId]?.stages[t.id]?.completed);
  }).length;
  const totalInGrade = gradeTasks.length || 5;

  // Remaining Chặng outside of current Cấp (Khám phá thêm)
  const activeChangIds = new Set(activeChangs.map((g) => g.mission.id));
  const otherChangs = missions.filter((m) => !activeChangIds.has(m.id));

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white p-6 sm:p-9 shadow-xl border-4 border-white">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Thành Phố An Toàn • Nhiệm Vụ ATGT</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              🛡️ THỬ THÁCH THÀNH PHỐ AN TOÀN – CẤP {selectedGrade}
            </h1>
            <p className="text-sky-100 text-xs sm:text-sm font-semibold max-w-xl">
              “Mỗi lựa chọn đúng – Thành phố thêm an toàn”. Vượt qua các nhiệm vụ theo từng chặng để rèn luyện kỹ năng an toàn và mở khóa huy hiệu dũng sĩ giao thông!
            </p>
          </div>

          {/* Cấp Selector */}
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 flex flex-col gap-1.5 shrink-0">
            <span className="text-[11px] font-black uppercase tracking-wider text-sky-200 text-center">
              Chọn Cấp học:
            </span>
            <div className="flex gap-1.5">
              {([1, 2, 3, 4, 5] as Grade[]).map((g) => (
                <button
                  key={g}
                  onClick={() => handleGradeChange(g)}
                  className={`px-3 py-2 rounded-xl font-black text-xs sm:text-sm transition-all flex flex-col items-center justify-center cursor-pointer ${
                    selectedGrade === g
                      ? 'bg-amber-400 text-slate-900 shadow-md shadow-amber-400/30 scale-105'
                      : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                  title={`Cấp ${g}`}
                >
                  <span className="leading-none">CẤP {g}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation View Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => {
            audioManager.playClick();
            setViewMode('grade_track');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer shrink-0 ${
            viewMode === 'grade_track'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
              : 'bg-white text-slate-600 hover:bg-sky-50 border border-slate-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Lộ Trình Cấp {selectedGrade} ({completedInGrade}/{totalInGrade} Nhiệm vụ)</span>
        </button>

        <button
          onClick={() => {
            audioManager.playClick();
            setViewMode('all_changs');
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer shrink-0 ${
            viewMode === 'all_changs'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
              : 'bg-white text-slate-600 hover:bg-sky-50 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Toàn Bộ 10 Chặng</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="relative bg-gradient-to-b from-sky-100 via-emerald-50 to-blue-50 rounded-3xl p-5 sm:p-8 border-4 border-sky-200 shadow-lg min-h-[520px] overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* =================================================================== */}
        {/* VIEW 1: LỘ TRÌNH THEO CẤP (GOM NHIỆM VỤ THEO CHẶNG) */}
        {/* =================================================================== */}
        {viewMode === 'grade_track' && (
          <div className="space-y-8 relative z-10">
            {/* Header Lộ Trình */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/90 backdrop-blur-xs p-5 rounded-3xl border-2 border-sky-200 shadow-sm">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-slate-800">
                    🛡️ THỬ THÁCH THÀNH PHỐ AN TOÀN – CẤP {selectedGrade}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm font-bold text-sky-800 mt-1">
                  Tiến trình: <span className="text-amber-600 font-black">{completedInGrade}/{totalInGrade}</span> nhiệm vụ đã chinh phục
                </p>
              </div>

              {/* Progress Bar Header */}
              <div className="flex items-center gap-3 w-full sm:w-60">
                <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
                  <div
                    style={{ width: `${Math.round((completedInGrade / totalInGrade) * 100)}%` }}
                    className="h-full bg-gradient-to-r from-amber-400 via-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                  />
                </div>
                <span className="text-xs font-black text-slate-700 shrink-0">
                  {Math.round((completedInGrade / totalInGrade) * 100)}%
                </span>
              </div>
            </div>

            {/* List of Grouped Chặng */}
            <div className="space-y-6">
              {activeChangs.map((group) => {
                const changNumber = group.mission.order || group.mission.missionNumber || 1;
                const changCompletedCount = group.tasks.filter(({ task }) => {
                  return Boolean(progressMap[task.missionId]?.stages[task.id]?.completed);
                }).length;
                const isChangFullyDone = changCompletedCount === group.tasks.length;

                return (
                  <div
                    key={group.mission.id}
                    className="bg-white/90 backdrop-blur-xs rounded-3xl p-5 sm:p-7 border-3 border-sky-200 shadow-md space-y-5"
                  >
                    {/* CHẶNG HEADER (Rendered ONLY ONCE per Chặng) */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-100 pb-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-400 to-blue-600 text-white flex items-center justify-center text-3xl shadow-md shadow-sky-500/20 shrink-0">
                          {group.mission.icon || '🚦'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black uppercase tracking-wider text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full">
                              CHẶNG {changNumber}
                            </span>
                            <span className="text-xs font-bold text-slate-500">
                              {group.tasks.length} Nhiệm vụ
                            </span>
                          </div>
                          <h2 className="text-lg sm:text-xl font-black text-slate-800 uppercase tracking-tight mt-0.5">
                            {group.mission.title}
                          </h2>
                        </div>
                      </div>

                      {/* Chặng completion status */}
                      <div className="flex items-center gap-2">
                        {isChangFullyDone ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Đã hoàn thành chặng
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                            Tiến độ: {changCompletedCount}/{group.tasks.length}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* TASKS IN THIS CHẶNG (Grid layout) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.tasks.map(({ task, indexInGrade }) => {
                        const missionProg = progressMap[task.missionId];
                        const stageProg = missionProg?.stages[task.id];
                        const isCompleted = Boolean(stageProg?.completed);

                        // Determine in progress vs available vs locked
                        const isInProgress =
                          !isCompleted &&
                          stageProg &&
                          (stageProg.introCompleted ||
                            stageProg.theoryCompleted ||
                            stageProg.phase === 'practice' ||
                            stageProg.phase === 'takeaway');

                        // Check if accessible:
                        // First task in grade is unlocked, or previous task in grade is completed, or currently in progress
                        let isUnlocked = indexInGrade === 1 || isCompleted || Boolean(isInProgress);
                        if (!isUnlocked && indexInGrade > 1) {
                          const prevTask = gradeTasks[indexInGrade - 2];
                          if (prevTask) {
                            const prevProg = progressMap[prevTask.missionId]?.stages[prevTask.id];
                            if (prevProg?.completed) isUnlocked = true;
                          }
                        }

                        // 3 Gamified Levels Progress State
                        const isLvl1Done =
                          isCompleted ||
                          Boolean(stageProg?.introCompleted) ||
                          Boolean(stageProg?.theoryCompleted) ||
                          Boolean(stageProg?.activitiesProgress?.[`${task.id}-act-1`]?.completed);

                        const isLvl2Done =
                          isCompleted ||
                          Boolean(stageProg?.activitiesProgress?.[`${task.id}-act-2`]?.completed);

                        const isLvl3Done =
                          isCompleted ||
                          Boolean(stageProg?.activitiesProgress?.[`${task.id}-act-3`]?.completed);

                        // Gamified status label & badge
                        let statusText = '🔒 Chưa mở khóa';
                        let statusBadgeClass = 'bg-slate-100 text-slate-500 border-slate-200';
                        if (isCompleted) {
                          statusText = '✅ Đã chinh phục';
                          statusBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                        } else if (isInProgress) {
                          statusText = '⏳ Đang chinh phục';
                          statusBadgeClass = 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse';
                        } else if (isUnlocked) {
                          statusText = '▶ Sẵn sàng';
                          statusBadgeClass = 'bg-sky-100 text-sky-800 border-sky-300';
                        }

                        return (
                          <div
                            key={task.id}
                            onClick={() => isUnlocked && handleOpenTask(task.missionId, task.id)}
                            className={`group rounded-3xl p-5 border-3 transition-all relative overflow-hidden flex flex-col justify-between ${
                              !isUnlocked
                                ? 'bg-slate-50/80 border-slate-200 opacity-60 cursor-not-allowed'
                                : isCompleted
                                ? 'bg-gradient-to-br from-emerald-50/90 via-white to-teal-50 border-emerald-400 shadow-md hover:shadow-xl hover:-translate-y-1 cursor-pointer'
                                : isInProgress
                                ? 'bg-gradient-to-br from-amber-50/90 via-white to-sky-50 border-amber-400 shadow-lg shadow-amber-400/20 scale-[1.01] cursor-pointer'
                                : 'bg-white border-sky-200 shadow-md hover:border-sky-400 hover:shadow-xl hover:-translate-y-1 cursor-pointer'
                            }`}
                          >
                            <div className="space-y-3">
                              {/* Task Single Progress Label & Status */}
                              <div className="flex items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-amber-900 bg-amber-100/90 px-3 py-1 rounded-full border border-amber-200">
                                  <span>🎯 NHIỆM VỤ {indexInGrade}/{totalInGrade}</span>
                                </span>

                                <span
                                  className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border ${statusBadgeClass}`}
                                >
                                  {statusText}
                                </span>
                              </div>

                              {/* Task Title */}
                              <h3 className="font-black text-base text-slate-800 group-hover:text-sky-600 transition-colors leading-snug">
                                {task.title}
                              </h3>

                              {/* 3 Gamified Levels Progress (🔍 Khám phá → 🧩 Giải mã → 🚦 Chinh phục) */}
                              <div className="py-2 px-3 bg-slate-50/90 rounded-2xl border border-slate-200/80 flex items-center justify-between text-[11px]">
                                {/* Level 1: Khám phá */}
                                <span
                                  className={
                                    isLvl1Done
                                      ? 'text-emerald-700 font-extrabold flex items-center gap-1'
                                      : isUnlocked
                                      ? 'text-slate-800 font-bold flex items-center gap-1'
                                      : 'text-slate-400 opacity-50 font-medium flex items-center gap-1'
                                  }
                                >
                                  <span>🔍 Khám phá</span>
                                  {isLvl1Done && <span className="text-emerald-600 font-black">✓</span>}
                                </span>

                                <span className="text-slate-300 font-bold">→</span>

                                {/* Level 2: Giải mã */}
                                <span
                                  className={
                                    isLvl2Done
                                      ? 'text-emerald-700 font-extrabold flex items-center gap-1'
                                      : (isLvl1Done || isInProgress)
                                      ? 'text-slate-800 font-bold flex items-center gap-1'
                                      : 'text-slate-400 opacity-50 font-medium flex items-center gap-1'
                                  }
                                >
                                  <span>🧩 Giải mã</span>
                                  {isLvl2Done && <span className="text-emerald-600 font-black">✓</span>}
                                </span>

                                <span className="text-slate-300 font-bold">→</span>

                                {/* Level 3: Chinh phục */}
                                <span
                                  className={
                                    isLvl3Done
                                      ? 'text-emerald-700 font-extrabold flex items-center gap-1'
                                      : isLvl2Done
                                      ? 'text-slate-800 font-bold flex items-center gap-1'
                                      : 'text-slate-400 opacity-50 font-medium flex items-center gap-1'
                                  }
                                >
                                  <span>🚦 Chinh phục</span>
                                  {isLvl3Done && <span className="text-emerald-600 font-black">✓</span>}
                                </span>
                              </div>

                              {/* Reward item */}
                              <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 pt-0.5">
                                <span>🎁</span>
                                <span>Vật phẩm:</span>
                                <span className="font-bold text-amber-800">
                                  {task.reward?.name || 'Huy Hiệu An Toàn'}
                                </span>
                              </p>
                            </div>

                            {/* Action Button */}
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                              {isCompleted ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenTask(task.missionId, task.id);
                                  }}
                                  className="w-full py-2.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-xs cursor-pointer"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>ÔN TẬP ↺</span>
                                </button>
                              ) : isInProgress ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenTask(task.missionId, task.id);
                                  }}
                                  className="w-full py-2.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 shadow-md shadow-amber-400/25 cursor-pointer"
                                >
                                  <Zap className="w-3.5 h-3.5 fill-current" />
                                  <span>TIẾP TỤC ⚡</span>
                                </button>
                              ) : isUnlocked ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenTask(task.missionId, task.id);
                                  }}
                                  className="w-full py-2.5 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-md shadow-sky-500/25 cursor-pointer"
                                >
                                  <span>BẮT ĐẦU ▶</span>
                                </button>
                              ) : (
                                <div className="w-full py-2.5 px-4 rounded-2xl bg-slate-100/80 text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200/60">
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>🔒 Chưa mở khóa</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chặng ngoài lộ trình chính (Khám phá thêm) */}
            {otherChangs.length > 0 && (
              <div className="pt-6 border-t-2 border-dashed border-sky-200 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider bg-slate-200 text-slate-700 px-3 py-1 rounded-full">
                    📚 KHÁM PHÁ THÊM
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Các Chặng an toàn giao thông khác (không thuộc lộ trình chính Cấp {selectedGrade})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {otherChangs.map((m) => {
                    const changNum = m.order || m.missionNumber || 1;
                    return (
                      <div
                        key={m.id}
                        onClick={() => handleOpenChang(m.id)}
                        className="p-4 rounded-2xl bg-white/70 hover:bg-white border border-slate-200 hover:border-sky-300 transition-all cursor-pointer opacity-75 hover:opacity-100 shadow-xs flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="text-2xl">{m.icon || '🚦'}</span>
                          <div className="truncate">
                            <span className="text-[10px] font-black uppercase text-slate-500 block">
                              CHẶNG {changNum}
                            </span>
                            <span className="text-xs font-bold text-slate-800 truncate block">
                              {m.title}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* VIEW 2: TOÀN BỘ 10 CHẶNG */}
        {/* =================================================================== */}
        {viewMode === 'all_changs' && (
          <div className="space-y-6 relative z-10">
            <div className="border-b border-sky-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2">
                  <span>🏙️ Toàn Bộ 10 Chặng ATGT Tiểu Học</span>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                    {missions.length} Chặng
                  </span>
                </h2>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  10 chuyên đề lớn bao quát toàn diện các kỹ năng tham gia giao thông dành cho học sinh Tiểu học.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {missions.map((mission) => {
                const prog = progressMap[mission.id];
                const isCompleted = Boolean(prog?.completed);
                const changTasks = allTasks.filter((t) => t.missionId === mission.id);
                const totalTasksCount = changTasks.length;
                const completedTasksCount = changTasks.filter(
                  (t) => prog?.stages[t.id]?.completed
                ).length;
                const percent =
                  totalTasksCount > 0
                    ? Math.min(100, Math.round((completedTasksCount / totalTasksCount) * 100))
                    : 0;

                return (
                  <div
                    key={mission.id}
                    onClick={() => handleOpenChang(mission.id)}
                    className={`group rounded-3xl p-5 border-3 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                      isCompleted
                        ? 'bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-emerald-400 shadow-md hover:shadow-xl hover:-translate-y-1'
                        : 'bg-white border-sky-200 shadow-md hover:border-sky-400 hover:shadow-xl hover:-translate-y-1'
                    }`}
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center text-3xl shadow-xs group-hover:scale-110 transition-transform shrink-0">
                          {mission.icon || '🏙️'}
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] font-black uppercase tracking-wider text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full">
                            CHẶNG {mission.order || mission.missionNumber}
                          </span>
                          <div className="mt-1">
                            {isCompleted ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Hoàn thành
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                {completedTasksCount}/{totalTasksCount} Nhiệm vụ
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1 my-2">
                        <h3 className="font-extrabold text-base text-slate-800 group-hover:text-sky-600 transition-colors leading-snug">
                          {mission.title}
                        </h3>
                        <p className="text-xs font-bold text-sky-700">
                          🎮 {mission.gameTitle || mission.title}
                        </p>
                        <p className="text-[11px] text-slate-500 font-semibold line-clamp-2 mt-1">
                          {mission.description}
                        </p>
                      </div>

                      {/* Nhiệm vụ list inside this Chặng */}
                      <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center justify-between">
                          <span>Các nhiệm vụ ({changTasks.length}):</span>
                          <span className="text-sky-700 font-bold">🔍 Khám phá • 🧩 Giải mã • 🚦 Chinh phục</span>
                        </div>
                        <div className="space-y-1">
                          {changTasks.map((t) => {
                            const taskCompleted = Boolean(prog?.stages[t.id]?.completed);
                            return (
                              <div
                                key={t.id}
                                className="flex items-center justify-between text-[11px] text-slate-700 bg-white px-2 py-1 rounded-lg border border-slate-200"
                              >
                                <span className="font-bold truncate max-w-[200px]">
                                  {t.title}
                                </span>
                                <span className="text-[10px] font-bold bg-sky-50 text-sky-800 px-1.5 py-0.2 rounded-sm shrink-0">
                                  Cấp {t.grade} {taskCompleted ? '✅' : '▶'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar & Footer */}
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span>Tiến độ chặng:</span>
                        <span className="font-black text-sky-700">{isCompleted ? '100%' : `${percent}%`}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          style={{ width: isCompleted ? '100%' : `${Math.max(12, percent)}%` }}
                          className={`h-full rounded-full transition-all ${
                            isCompleted
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                              : 'bg-gradient-to-r from-sky-400 to-blue-500'
                          }`}
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          <span>{mission.finalBadge?.name || `Huy Hiệu ${mission.title}`}</span>
                        </span>
                        <span className="font-black text-xs text-sky-600 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                          <span>Khám phá chặng</span>
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
