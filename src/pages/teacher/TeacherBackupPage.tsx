import React, { useState } from 'react';
import { exportAllCurriculum, restoreCurriculumFromJson } from '../../services/backupService';
import { audioManager } from '../../services/audioService';
import { Save, Download, Upload, CheckCircle2, AlertTriangle, FileJson, ShieldCheck } from 'lucide-react';

export const TeacherBackupPage: React.FC = () => {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [restoreMode, setRestoreMode] = useState<'import_as_draft' | 'skip_published'>('import_as_draft');

  const handleExportAll = async () => {
    audioManager.playClick();
    const jsonStr = await exportAllCurriculum();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thanh-pho-an-toan-curriculum-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    audioManager.playReward();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const res = await restoreCurriculumFromJson(content, restoreMode);
        setImportStatus(`Đã khôi phục thành công ${res.restoredCount} bài học!`);
        setImportErrors(res.errors);
        audioManager.playReward();
      } catch (err: any) {
        setImportStatus(null);
        setImportErrors([err.message || 'Lỗi không xác định khi nhập dữ liệu.']);
        audioManager.playWrong();
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div>
        <h2 className="text-2xl font-black text-slate-800">
          💾 Sao Lưu & Khôi Phục Học Liệu
        </h2>
        <p className="text-xs text-slate-500 font-bold mt-0.5">
          Xuất dữ liệu 25 bài học chuẩn hóa ra tập tin JSON an toàn (không chứa thông tin cá nhân hay mật khẩu).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Export Card */}
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-800">
              Xuất Toàn Bộ Chương Trình (25 Bài)
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Tải về tập tin JSON chứa trọn vẹn 25 bài học, 175 chặng, câu hỏi thực hành, điểm số và gợi ý RITA.
            </p>
          </div>

          <button
            onClick={handleExportAll}
            className="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Tải tập tin sao lưu JSON</span>
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-800">
              Khôi Phục Từ Tập Tin JSON
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Tải lên tập tin sao lưu hợp lệ. Hệ thống sẽ kiểm tra schemaVersion và không ghi đè bài đã xuất bản.
            </p>

            <div className="pt-2">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Quy tắc xử lý nếu bài học đã xuất bản:
              </label>
              <select
                value={restoreMode}
                onChange={(e) => setRestoreMode(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 bg-slate-50"
              >
                <option value="import_as_draft">Tạo phiên bản Bản nháp (Draft clone) mới</option>
                <option value="skip_published">Bỏ qua bài đã xuất bản (Giữ nguyên)</option>
              </select>
            </div>
          </div>

          <label className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer text-center">
            <Upload className="w-4 h-4" />
            <span>Chọn file JSON để khôi phục</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Import Status feedback */}
      {importStatus && (
        <div className="bg-emerald-50 border-2 border-emerald-300 p-4 rounded-3xl text-xs font-bold text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{importStatus}</span>
        </div>
      )}

      {importErrors.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-300 p-4 rounded-3xl text-xs text-rose-900 space-y-1.5 animate-in fade-in">
          <div className="flex items-center gap-2 font-black">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>Thông báo lỗi nhập dữ liệu:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 font-semibold">
            {importErrors.map((e, idx) => (
              <li key={idx}>{e}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
