import React, { useState, useEffect } from 'react';
import { Journey } from '../../types';
import { getAllJourneys } from '../../services/curriculumService';
import { idbGetAll, STORES } from '../../db/indexedDb';
import { audioManager } from '../../services/audioService';
import { 
  Map, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';

interface TeacherOverviewProps {
  onNavigate: (route: string) => void;
}

export const TeacherOverviewPage: React.FC<TeacherOverviewProps> = ({ onNavigate }) => {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [publishedCount, setPublishedCount] = useState(0);
  const [draftCount, setDraftCount] = useState(0);
  const [studentProgressCount, setStudentProgressCount] = useState(0);

  useEffect(() => {
    getAllJourneys().then((list) => {
      setJourneys(list);
      setPublishedCount(list.filter((j) => j.status === 'published').length);
      setDraftCount(list.filter((j) => j.status === 'draft').length);
    });

    idbGetAll(STORES.PROGRESS).then((progs) => {
      setStudentProgressCount(progs.filter((p: any) => p.completed).length);
    });
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Tổng quan Studio Giảng dạy
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
            Quản trị 25 bài học An toàn giao thông chuẩn hóa cho 5 khối tiểu học.
          </p>
        </div>

        <button
          onClick={() => {
            audioManager.playClick();
            onNavigate('/teacher/journeys');
          }}
          className="px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs sm:text-sm shadow-md shadow-sky-500/25 flex items-center gap-2 self-start cursor-pointer"
        >
          <span>Xem danh sách 25 bài học</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center text-xl mb-3">
            📚
          </div>
          <p className="text-xs font-bold text-slate-500">Tổng số bài học</p>
          <h3 className="text-2xl font-black text-slate-800 mt-1">25 Bài</h3>
          <p className="text-[11px] text-sky-600 font-bold mt-1">5 khối (Lớp 1 – 5)</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl mb-3">
            ✅
          </div>
          <p className="text-xs font-bold text-slate-500">Đã xuất bản (Publish)</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">{publishedCount} Bài</h3>
          <p className="text-[11px] text-slate-400 font-semibold mt-1">Học sinh được học</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl mb-3">
            📝
          </div>
          <p className="text-xs font-bold text-slate-500">Đang soạn (Bản nháp)</p>
          <h3 className="text-2xl font-black text-amber-600 mt-1">{draftCount} Bài</h3>
          <p className="text-[11px] text-slate-400 font-semibold mt-1">Sẵn sàng bổ sung học liệu</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl mb-3">
            🎓
          </div>
          <p className="text-xs font-bold text-slate-500">Học sinh hoàn thành</p>
          <h3 className="text-2xl font-black text-purple-600 mt-1">{studentProgressCount} Lượt</h3>
          <p className="text-[11px] text-slate-400 font-semibold mt-1">Chứng nhận đã cấp</p>
        </div>
      </div>

      {/* Grade Quick Jump */}
      <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base text-slate-800">
          Chương trình 5 Khối Lớp (Mỗi khối 5 bài học – 7 chặng/bài)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((grade) => {
            const gradeJourneys = journeys.filter((j) => j.grade === grade);
            const pubInGrade = gradeJourneys.filter((j) => j.status === 'published').length;

            return (
              <div
                key={grade}
                onClick={() => {
                  audioManager.playClick();
                  onNavigate('/teacher/journeys');
                }}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 transition-all cursor-pointer text-center space-y-1"
              >
                <div className="text-2xl">
                  {grade === 1 ? '🏫' : grade === 2 ? '🚸' : grade === 3 ? '🚦' : grade === 4 ? '🚲' : '🔄'}
                </div>
                <h4 className="font-black text-sm text-slate-800">Khối Lớp {grade}</h4>
                <p className="text-[11px] font-bold text-slate-500">5 bài học</p>
                <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {pubInGrade}/5 Đã xuất bản
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
