import React, { useState, useEffect, useRef } from 'react';
import { Journey, Stage, Activity, ActivityType } from '../../types';
import { getJourneyById, saveJourney, createDraftVersion, publishJourney, validateJourneyForPublish } from '../../services/curriculumService';
import { audioManager } from '../../services/audioService';
import { 
  ArrowLeft, 
  Save, 
  Sparkles, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  Upload,
  Lock,
  Unlock,
  ShieldCheck,
  Zap,
  HelpCircle
} from 'lucide-react';

interface QuickEditorProps {
  journeyId: string;
  onBack: () => void;
  onNavigateToPreview: (journeyId: string) => void;
}

export const QuickContentEditorPage: React.FC<QuickEditorProps> = ({
  journeyId,
  onBack,
  onNavigateToPreview,
}) => {
  const [journey, setJourney] = useState<Journey | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [expandedStages, setExpandedStages] = useState<Record<number, boolean>>({ 1: true, 2: true });
  const [validationModal, setValidationModal] = useState<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    getJourneyById(journeyId).then(setJourney);
  }, [journeyId]);

  // Debounced Autosave (1000ms)
  const triggerAutosave = (updated: Journey) => {
    setSaveStatus('saving');
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(async () => {
      await saveJourney(updated);
      setSaveStatus('saved');
    }, 1000);
  };

  const handleUpdateStage = (stageOrder: number, partialStage: Partial<Stage>) => {
    if (!journey) return;
    const stages = journey.stages.map((s) => {
      if (s.order === stageOrder) {
        return { ...s, ...partialStage };
      }
      return s;
    });

    const updated: Journey = { ...journey, stages };
    setJourney(updated);
    triggerAutosave(updated);
  };

  const handleUpdateTheory = (stageOrder: number, field: string, value: any) => {
    if (!journey) return;
    const stage = journey.stages.find((s) => s.order === stageOrder);
    if (!stage) return;

    const newTheory = { ...stage.theory, [field]: value };
    handleUpdateStage(stageOrder, { theory: newTheory });
  };

  const handleAddActivity = (stageOrder: number) => {
    if (!journey) return;
    audioManager.playClick();
    const stage = journey.stages.find((s) => s.order === stageOrder);
    if (!stage) return;

    const newActId = `${journey.id}-s${stageOrder}-a${stage.activities.length + 1}`;
    const newAct: Activity = {
      id: newActId,
      stageId: stage.id,
      type: 'single_choice',
      difficulty: 'basic',
      prompt: 'Khi tham gia giao thông trên đường, em cần chú ý điều gì?',
      options: [
        { id: 'opt-1', label: 'Quan sát cẩn thận hai bên đường', isCorrect: true },
        { id: 'opt-2', label: 'Vừa đi vừa cúi đầu xem đồ chơi' },
      ],
      correctAnswer: 'opt-1',
      score: 10,
      feedbackCorrect: 'Rất chính xác! Luôn quan sát cẩn thận là hành động an toàn.',
      feedbackWrong: 'Chưa đúng! Không quan sát sẽ rất dễ gặp nguy hiểm.',
      ritaHint: 'Bạn hãy nhìn xem hành động nào giúp chúng mình thấy được xe cộ đang tới gần?',
      verified: true,
      required: true,
    };

    const newActivities = [...stage.activities, newAct];
    handleUpdateStage(stageOrder, { activities: newActivities });
  };

  const handleRemoveActivity = (stageOrder: number, actId: string) => {
    if (!journey) return;
    audioManager.playClick();
    const stage = journey.stages.find((s) => s.order === stageOrder);
    if (!stage) return;

    const newActivities = stage.activities.filter((a) => a.id !== actId);
    handleUpdateStage(stageOrder, { activities: newActivities });
  };

  const toggleExpand = (order: number) => {
    setExpandedStages((prev) => ({ ...prev, [order]: !prev[order] }));
  };

  const handleCreateDraftClone = async () => {
    if (!journey) return;
    audioManager.playReward();
    const newDraft = await createDraftVersion(journey.id);
    setJourney(newDraft);
  };

  const handlePublishNow = async () => {
    if (!journey) return;
    audioManager.playClick();
    const res = validateJourneyForPublish(journey);
    if (!res.valid) {
      setValidationModal(res);
      return;
    }

    await publishJourney(journey.id);
    const updated = await getJourneyById(journey.id);
    if (updated) setJourney(updated);
    audioManager.playReward();
    setValidationModal({ valid: true, errors: [], warnings: res.warnings });
  };

  if (!journey) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isPublished = journey.status === 'published';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header Sticky Bar */}
      <div className="sticky top-0 z-30 bg-slate-100/90 backdrop-blur-md py-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              audioManager.playClick();
              onBack();
            }}
            className="w-10 h-10 rounded-2xl bg-white hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">
                Lớp {journey.grade} • v{journey.version}
              </span>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {isPublished ? 'Đã Xuất Bản (Read-only)' : 'Bản Nháp (Draft)'}
              </span>
              {/* Autosave status pill */}
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                {saveStatus === 'saving' && <span className="animate-spin text-sky-600">⏳ Đang lưu...</span>}
                {saveStatus === 'saved' && <span className="text-emerald-600">✅ Đã lưu</span>}
              </span>
            </div>
            <h1 className="text-lg font-black text-slate-800">
              ⚡ Soạn Nhanh Học Liệu: {journey.title}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToPreview(journey.id)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem thử</span>
          </button>

          {isPublished ? (
            <button
              onClick={handleCreateDraftClone}
              className="px-4 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-white shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Tạo bản chỉnh sửa (v{journey.version + 1})</span>
            </button>
          ) : (
            <button
              onClick={handlePublishNow}
              className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Xuất bản (Publish)</span>
            </button>
          )}
        </div>
      </div>

      {isPublished && (
        <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-3xl flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              <strong>Bản này đã xuất bản:</strong> Để bảo vệ tiến độ học sinh đang học, bài học ở chế độ chỉ đọc. Bấm <em>“Tạo bản chỉnh sửa”</em> để nhân bản sang v{journey.version + 1} Draft.
            </span>
          </div>
        </div>
      )}

      {/* 7 STAGES VERTICAL FLOW */}
      <div className="space-y-4">
        {journey.stages.map((stage) => {
          const isExpanded = expandedStages[stage.order] ?? false;

          return (
            <div
              key={stage.id}
              className="bg-white rounded-3xl border-2 border-slate-200 shadow-xs overflow-hidden transition-all"
            >
              {/* Stage Collapsible Header */}
              <div
                onClick={() => toggleExpand(stage.order)}
                className="p-4 sm:p-5 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between cursor-pointer border-b border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-800 font-black text-sm flex items-center justify-center shrink-0">
                    {stage.order}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-sky-800">
                      Chặng {stage.order} {stage.isFinalStage && '• Về Đích 🏆'}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-800">
                      {stage.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    stage.theory.content && stage.activities.length > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {stage.theory.content && stage.activities.length > 0 ? '🟢 Sẵn sàng offline' : '🟡 Đang soạn'}
                  </span>
                  <span className="text-xs font-bold text-slate-500 hidden sm:inline">
                    {stage.activities.length} Thực hành • Thưởng: {stage.reward.name}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Stage Details (when expanded) */}
              {isExpanded && (
                <div className="p-5 sm:p-7 space-y-6">
                  {/* 1. KHỞI ĐỘNG (INTRO) */}
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black text-amber-900 uppercase">
                      <span>🎬 Khởi động chặng</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Hình thức khởi động:
                        </label>
                        <select
                          disabled={isPublished}
                          value={stage.intro.type}
                          onChange={(e) =>
                            handleUpdateStage(stage.order, {
                              intro: { ...stage.intro, type: e.target.value as any },
                            })
                          }
                          className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white"
                        >
                          <option value="song">Bài hát vui nhộn</option>
                          <option value="movement">Vận động nhẹ</option>
                          <option value="animation">RITA hoạt hình</option>
                          <option value="story">Câu chuyện tình huống</option>
                          <option value="image">Hình ảnh gợi mở</option>
                          <option value="none">Bỏ trống (không bắt buộc)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Mô tả / Lời dẫn khởi động:
                        </label>
                        <input
                          type="text"
                          disabled={isPublished}
                          value={stage.intro.description || ''}
                          onChange={(e) =>
                            handleUpdateStage(stage.order, {
                              intro: { ...stage.intro, description: e.target.value },
                            })
                          }
                          placeholder="Ví dụ: Cùng RITA hát vang khúc ca vạch kẻ đường..."
                          className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. LÝ THUYẾT (THEORY) */}
                  <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-900 uppercase flex items-center gap-1.5">
                        <span>📚 Lý thuyết trọng tâm</span>
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Tiêu đề bài học lý thuyết:
                        </label>
                        <input
                          type="text"
                          disabled={isPublished}
                          value={stage.theory.title}
                          onChange={(e) => handleUpdateTheory(stage.order, 'title', e.target.value)}
                          placeholder="Tiêu đề lý thuyết..."
                          className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Nội dung kiến thức an toàn giao thông:
                        </label>
                        <textarea
                          rows={4}
                          disabled={isPublished}
                          value={stage.theory.content}
                          onChange={(e) => handleUpdateTheory(stage.order, 'content', e.target.value)}
                          placeholder="Nhập nội dung kiến thức chuẩn mực cần truyền đạt cho học sinh..."
                          className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white leading-relaxed"
                        />
                      </div>

                      {/* Checkboxes: Required, Verified, Allowed for RITA */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs font-bold text-slate-700">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            disabled={isPublished}
                            checked={stage.theory.requiredBeforePractice}
                            onChange={(e) =>
                              handleUpdateTheory(stage.order, 'requiredBeforePractice', e.target.checked)
                            }
                            className="rounded-md w-4 h-4 text-emerald-600"
                          />
                          <span>Bắt buộc học trước thực hành</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            disabled={isPublished}
                            checked={stage.theory.verified}
                            onChange={(e) =>
                              handleUpdateTheory(stage.order, 'verified', e.target.checked)
                            }
                            className="rounded-md w-4 h-4 text-emerald-600"
                          />
                          <span>Đã kiểm chứng nguồn chuẩn</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            disabled={isPublished}
                            checked={stage.theory.allowedForRita}
                            onChange={(e) =>
                              handleUpdateTheory(stage.order, 'allowedForRita', e.target.checked)
                            }
                            className="rounded-md w-4 h-4 text-purple-600"
                          />
                          <span>Cho phép RITA AI tham chiếu</span>
                        </label>
                      </div>

                      {/* Asset Manager: Upload / Preview / Replace / Remove */}
                      <div className="pt-2 border-t border-emerald-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="font-bold text-slate-600 text-[11px] shrink-0">Đính kèm học liệu (Ảnh/Video):</span>
                          <input
                            type="text"
                            disabled={isPublished}
                            value={stage.theory.video?.url || ''}
                            onChange={(e) =>
                              handleUpdateTheory(stage.order, 'video', {
                                url: e.target.value,
                                minWatchPercent: 80,
                              })
                            }
                            placeholder="Dán đường dẫn ảnh / video bài học..."
                            className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs flex-1"
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          {stage.theory.video?.url && (
                            <>
                              <button
                                type="button"
                                onClick={() => window.open(stage.theory.video?.url, '_blank')}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                              >
                                Xem trước
                              </button>
                              {!isPublished && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateTheory(stage.order, 'video', undefined)}
                                  className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[11px]"
                                >
                                  Xóa
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. THỰC HÀNH (PRACTICE ACTIVITIES) */}
                  <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-sky-900 uppercase flex items-center gap-1.5">
                        <span>🎮 Thử thách thực hành ({stage.activities.length} câu)</span>
                      </span>

                      {!isPublished && (
                        <button
                          onClick={() => handleAddActivity(stage.order)}
                          className="px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Thêm hoạt động</span>
                        </button>
                      )}
                    </div>

                    {stage.activities.length > 0 ? (
                      <div className="space-y-3">
                        {stage.activities.map((act, aIdx) => (
                          <div
                            key={act.id}
                            className="p-3.5 rounded-2xl bg-white border border-sky-200 shadow-xs space-y-2.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">
                                Câu {aIdx + 1} • {act.type} • +{act.score}đ
                              </span>
                              {!isPublished && (
                                <button
                                  onClick={() => handleRemoveActivity(stage.order, act.id)}
                                  className="text-slate-400 hover:text-rose-500 p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>

                            <input
                              type="text"
                              disabled={isPublished}
                              value={act.prompt}
                              onChange={(e) => {
                                const newActs = [...stage.activities];
                                newActs[aIdx].prompt = e.target.value;
                                handleUpdateStage(stage.order, { activities: newActs });
                              }}
                              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200"
                            />

                            <div className="text-[11px] font-semibold text-purple-700 bg-purple-50 p-2 rounded-xl flex items-center gap-2">
                              <span>🤖 Gợi ý RITA:</span>
                              <input
                                type="text"
                                disabled={isPublished}
                                value={act.ritaHint || ''}
                                onChange={(e) => {
                                  const newActs = [...stage.activities];
                                  newActs[aIdx].ritaHint = e.target.value;
                                  handleUpdateStage(stage.order, { activities: newActs });
                                }}
                                placeholder="Gợi ý quan sát để RITA giúp học sinh suy nghĩ..."
                                className="flex-1 px-2 py-1 bg-white border border-purple-200 rounded-lg text-xs"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic text-center py-2">
                        Chưa có câu hỏi thực hành. Bấm “+ Thêm hoạt động” để tạo câu hỏi trắc nghiệm hoặc sắp xếp.
                      </p>
                    )}
                  </div>

                  {/* 4. GHI NHỚ VÀNG & PHẦN THƯỞNG */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Takeaway */}
                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 block">
                        💡 Em Cần Nhớ (Key Takeaway)
                      </span>
                      <textarea
                        rows={2}
                        disabled={isPublished}
                        value={stage.keyTakeaway}
                        onChange={(e) => handleUpdateStage(stage.order, { keyTakeaway: e.target.value })}
                        placeholder="1-2 câu ngắn gọn đúc kết bài học..."
                        className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-amber-200 bg-white"
                      />
                    </div>

                    {/* Reward */}
                    <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-indigo-900 block">
                        🎁 Phần Thưởng Chặng
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          disabled={isPublished}
                          value={stage.reward.icon}
                          onChange={(e) =>
                            handleUpdateStage(stage.order, {
                              reward: { ...stage.reward, icon: e.target.value },
                            })
                          }
                          className="w-12 text-center text-lg p-1.5 rounded-xl border border-indigo-200 bg-white"
                        />
                        <input
                          type="text"
                          disabled={isPublished}
                          value={stage.reward.name}
                          onChange={(e) =>
                            handleUpdateStage(stage.order, {
                              reward: { ...stage.reward, name: e.target.value },
                            })
                          }
                          placeholder="Tên vật phẩm..."
                          className="flex-1 px-3 py-1.5 text-xs font-bold rounded-xl border border-indigo-200 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Validation Result Modal */}
      {validationModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-4 border-slate-200 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="text-center space-y-1">
              <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-1 ${
                validationModal.valid ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
              }`}>
                {validationModal.valid ? '🎉' : '⚠️'}
              </div>
              <h3 className="text-lg font-black text-slate-800">
                {validationModal.valid ? 'Xuất Bản Thành Công!' : 'Chưa Thể Xuất Bản'}
              </h3>
            </div>

            {validationModal.errors.length > 0 && (
              <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-200 text-xs text-rose-900 space-y-1.5">
                <span className="font-black block uppercase text-[10px] tracking-wider text-rose-700">
                  Lỗi bắt buộc:
                </span>
                <ul className="list-disc pl-4 space-y-1 font-semibold">
                  {validationModal.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => setValidationModal(null)}
              className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
