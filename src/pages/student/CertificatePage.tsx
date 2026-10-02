import React, { useState, useEffect } from 'react';
import { CertificateData, Journey, JourneyProgress } from '../../types';
import { getCertificate, createOrGetCertificate } from '../../services/rewardService';
import { getJourneyById } from '../../services/curriculumService';
import { getJourneyProgress } from '../../services/progressService';
import { getStudentProfile } from '../../services/profileService';
import { audioManager } from '../../services/audioService';
import { ArrowLeft, Printer, Award, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

interface CertificatePageProps {
  journeyId: string;
  onBack: () => void;
}

export const CertificatePage: React.FC<CertificatePageProps> = ({ journeyId, onBack }) => {
  const [cert, setCert] = useState<CertificateData | null>(null);
  const [journey, setJourney] = useState<Journey | null>(null);

  useEffect(() => {
    loadCertificate();
  }, [journeyId]);

  const loadCertificate = async () => {
    const j = await getJourneyById(journeyId);
    if (!j) return;
    setJourney(j);

    let certificate = await getCertificate(journeyId);
    if (!certificate) {
      const progress = await getJourneyProgress(journeyId);
      const profile = await getStudentProfile();
      certificate = await createOrGetCertificate(
        j.id,
        j.title,
        j.grade,
        progress.totalScore,
        j.maxScore,
        j.finalBadge,
        profile.nickname
      );
    }
    setCert(certificate);
  };

  const handlePrint = () => {
    audioManager.playClick();
    window.print();
  };

  if (!cert || !journey) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      {/* Top action buttons (hidden when printing) */}
      <div className="flex items-center justify-between print:hidden">
        <button
          onClick={() => {
            audioManager.playClick();
            onBack();
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-sky-50 border-2 border-slate-200 text-slate-700 font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm shadow-md shadow-amber-500/25 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>🖨️ In / Lưu PDF</span>
        </button>
      </div>

      {/* OFFICIAL CERTIFICATE DOCUMENT */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border-8 border-amber-400 shadow-2xl relative overflow-hidden text-center space-y-6 print:border-4 print:shadow-none print:m-0">
        {/* Decorative corner patterns */}
        <div className="absolute top-3 left-3 w-12 h-12 border-t-4 border-l-4 border-amber-500" />
        <div className="absolute top-3 right-3 w-12 h-12 border-t-4 border-r-4 border-amber-500" />
        <div className="absolute bottom-3 left-3 w-12 h-12 border-b-4 border-l-4 border-amber-500" />
        <div className="absolute bottom-3 right-3 w-12 h-12 border-b-4 border-r-4 border-amber-500" />

        {/* Header Branding */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2 text-3xl mb-1">
            <span>🚦</span>
            <span className="font-black text-slate-900 tracking-wider">THÀNH PHỐ AN TOÀN</span>
            <span>🚸</span>
          </div>
          <p className="text-xs uppercase tracking-widest font-black text-amber-700">
            HÀNH TRÌNH HỌC TẬP SỐ VỀ AN TOÀN GIAO THÔNG
          </p>
        </div>

        {/* Certificate Title */}
        <div className="py-2">
          <h1 className="text-2xl sm:text-4xl font-black text-amber-950 uppercase tracking-tight">
            GIẤY CHỨNG NHẬN
          </h1>
          <p className="text-xs sm:text-sm font-bold text-slate-600 mt-1 italic">
            Chứng nhận đã hoàn thành xuất sắc khóa học an toàn đường bộ
          </p>
        </div>

        {/* Student Name */}
        <div className="py-3 border-y-2 border-dashed border-amber-200 space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase">Trao tặng cho Nhà thám hiểm:</p>
          <h2 className="text-3xl sm:text-4xl font-black text-sky-800 tracking-wide underline decoration-amber-400 decoration-wavy underline-offset-8">
            {cert.nickname}
          </h2>
          <p className="text-xs font-black text-slate-600 mt-2">
            Học sinh Khối Lớp {cert.grade}
          </p>
        </div>

        {/* Journey & Badge Details */}
        <div className="space-y-2 max-w-lg mx-auto">
          <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
            Đã hoàn thành toàn bộ 7 chặng thử thách của bài học:
          </p>
          <h3 className="text-lg sm:text-xl font-black text-slate-900">
            “{cert.journeyTitle}”
          </h3>

          <div className="pt-2 flex items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-3xl shadow-xs">
              {cert.finalBadge.icon}
            </div>
            <div className="text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                Danh hiệu đạt được
              </span>
              <span className="font-extrabold text-sm sm:text-base text-slate-800">
                {cert.finalBadge.name}
              </span>
            </div>
          </div>
        </div>

        {/* Score & Stamp */}
        <div className="pt-6 grid grid-cols-2 gap-4 border-t border-slate-200 text-left text-xs">
          <div>
            <p className="font-bold text-slate-500">Mã chứng nhận duy nhất:</p>
            <p className="font-black text-sky-800 tracking-wider text-xs sm:text-sm font-mono mt-0.5">
              {cert.certificateCode}
            </p>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">
              Ngày cấp: {cert.completionDate}
            </p>
          </div>

          <div className="text-right flex flex-col items-end">
            <div className="w-20 h-20 rounded-full border-4 border-red-500/80 p-1 flex flex-col items-center justify-center text-red-600 font-black rotate-[-12deg] shadow-xs select-none">
              <span className="text-[8px] uppercase tracking-tighter">BAN AN TOÀN</span>
              <span className="text-lg">⭐</span>
              <span className="text-[8px] uppercase tracking-tighter">ĐÃ CHỨNG THỰC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
