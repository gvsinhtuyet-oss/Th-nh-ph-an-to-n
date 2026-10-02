import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Backpack, BookOpen, MapPin, Wifi, WifiOff, Award, Sparkles, User } from 'lucide-react';
import { StudentProfile } from '../../types';
import { getStudentProfile, updateStudentProfile } from '../../services/profileService';
import { audioManager } from '../../services/audioService';

interface StudentHeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  starsCount?: number;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({ currentRoute, onNavigate, starsCount }) => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');
  const [gradeInput, setGradeInput] = useState<number>(2);

  useEffect(() => {
    getStudentProfile().then(p => {
      setProfile(p);
      setNicknameInput(p.nickname);
      setGradeInput(p.grade);
    });

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioManager.setMuted(nextMuted);
    if (!nextMuted) {
      audioManager.playClick();
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicknameInput.trim()) return;
    const updated = await updateStudentProfile({
      nickname: nicknameInput.trim(),
      grade: gradeInput as any,
    });
    setProfile(updated);
    setShowProfileModal(false);
    audioManager.playReward();
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-sky-100 shadow-sm px-3 sm:px-6 py-2.5 flex items-center justify-between">
        {/* Left: App Logo & Slogan */}
        <div 
          onClick={() => { audioManager.playClick(); onNavigate('/'); }} 
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-2xl shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            🚦
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg text-slate-800 tracking-tight leading-none group-hover:text-sky-600 transition-colors">
                THÀNH PHỐ AN TOÀN
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 font-semibold leading-tight hidden xs:block">
              Mỗi lựa chọn đúng – Thành phố thêm an toàn
            </p>
          </div>
        </div>

        {/* Middle Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => { audioManager.playClick(); onNavigate('/'); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              currentRoute === '/' || currentRoute === '/city' || currentRoute.startsWith('/journey')
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                : 'text-slate-600 hover:bg-sky-50 hover:text-sky-600'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Bản đồ</span>
          </button>

          <button
            onClick={() => { audioManager.playClick(); onNavigate('/inventory'); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              currentRoute === '/inventory'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-600'
            }`}
          >
            <Backpack className="w-4 h-4" />
            <span className="hidden sm:inline">Ba lô</span>
          </button>

          <button
            onClick={() => { audioManager.playClick(); onNavigate('/notebook'); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              currentRoute === '/notebook'
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Sổ tay</span>
          </button>
        </nav>

        {/* Right Info & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Online/Offline indicator */}
          <div 
            title={isOnline ? 'Đang có kết nối mạng' : 'Đang hoạt động ngoại tuyến'}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold ${
              isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}
          >
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span className="hidden md:inline">{isOnline ? 'Trực tuyến' : 'Ngoại tuyến'}</span>
          </div>

          {/* Stars */}
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl shadow-xs">
            <span className="text-amber-500 text-sm">⭐</span>
            <span className="font-extrabold text-amber-700 text-xs sm:text-sm">
              {starsCount !== undefined ? starsCount : (profile?.totalStars || 0)}
            </span>
          </div>

          {/* Student Profile Pill */}
          <button
            onClick={() => { audioManager.playClick(); setShowProfileModal(true); }}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 transition-colors"
          >
            <span className="text-sm">🧒</span>
            <span className="hidden sm:inline max-w-[100px] truncate">{profile?.nickname || 'Nhà thám hiểm'}</span>
            <span className="bg-sky-200 text-sky-800 text-[10px] px-1.5 py-0.5 rounded-md">Lớp {profile?.grade || 2}</span>
          </button>

          {/* Mute button */}
          <button
            onClick={toggleSound}
            aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </header>

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-4 border-sky-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto bg-sky-100 rounded-full flex items-center justify-center text-3xl mb-2">
                🧒
              </div>
              <h3 className="text-xl font-black text-slate-800">Thông tin Nhà thám hiểm</h3>
              <p className="text-xs text-slate-500">Đặt tên và chọn khối lớp để tham gia thử thách</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Tên của em:</label>
                <input
                  type="text"
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  maxLength={25}
                  placeholder="Ví dụ: Minh Khang, An Nhiên..."
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 focus:border-sky-500 focus:outline-hidden font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Em học Lớp mấy?</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGradeInput(g)}
                      className={`py-2 rounded-xl font-black text-sm border-2 transition-all ${
                        gradeInput === g
                          ? 'bg-sky-500 text-white border-sky-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 py-2.5 rounded-2xl font-bold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl font-bold text-sm bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/20"
                >
                  Lưu lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
