import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Map, 
  Zap, 
  BookOpen, 
  HelpCircle, 
  Gift, 
  Music, 
  Bot, 
  Download, 
  Eye, 
  Save, 
  ClipboardCheck, 
  TrendingUp, 
  Presentation,
  LogOut,
  AlertTriangle,
  ArrowLeft,
  Menu,
  X
} from 'lucide-react';
import { firebaseService, AuthUserState } from '../../services/firebaseService';
import { audioManager } from '../../services/audioService';

interface TeacherLayoutProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  children: React.ReactNode;
}

export const TeacherLayout: React.FC<TeacherLayoutProps> = ({
  currentRoute,
  onNavigate,
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<AuthUserState | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsub = firebaseService.onAuthStateChanged(setCurrentUser);
    return unsub;
  }, []);

  const menuItems = [
    { id: '/teacher', label: 'Tổng quan', icon: BarChart3 },
    { id: '/teacher/journeys', label: 'Hành trình (25 bài)', icon: Map },
    { id: '/teacher/offline', label: 'Bộ nhớ Ngoại tuyến', icon: Download },
    { id: '/teacher/preview', label: 'Xem thử & Test Mode', icon: Eye },
    { id: '/teacher/demo', label: 'Trình diễn Demo', icon: Presentation },
    { id: '/teacher/backup', label: 'Sao lưu & Khôi phục', icon: Save },
  ];

  const handleLogin = async () => {
    audioManager.playClick();
    await firebaseService.loginAsTeacher();
  };

  const handleLogout = async () => {
    audioManager.playClick();
    await firebaseService.logout();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Nunito',sans-serif]">
      {/* Top Banner if in Local Dev Mode (Rule 50) */}
      {!firebaseService.isCloudConfigured() && (
        <div className="bg-amber-500 text-slate-900 px-4 py-1.5 text-xs font-black flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Đang chạy chế độ cục bộ (IndexedDB) – chưa đồng bộ đám mây Firebase.</span>
          </div>
          <span className="hidden sm:inline bg-black/10 px-2 py-0.5 rounded-md text-[10px]">
            Toàn bộ 25 bài học lưu trữ an toàn trong trình duyệt
          </span>
        </div>
      )}

      {/* Main Bar */}
      <header className="bg-slate-900 text-white px-4 sm:px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={() => onNavigate('/teacher')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center text-xl shadow-xs">
              🚦
            </div>
            <div>
              <h1 className="font-black text-base sm:text-lg leading-tight tracking-tight">
                TEACHER STUDIO
              </h1>
              <p className="text-[11px] text-sky-400 font-bold">Thành Phố An Toàn</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              audioManager.playClick();
              onNavigate('/');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Về Student App</span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300 hidden md:inline">
                {currentUser.displayName}
              </span>
              <button
                onClick={handleLogout}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 flex items-center justify-center"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs shadow-xs"
            >
              Đăng nhập Giáo Viên
            </button>
          )}
        </div>
      </header>

      {/* Body with Sidebar & Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Desktop */}
        <aside className="hidden md:flex flex-col w-64 bg-slate-800 text-slate-300 border-r border-slate-700 p-4 shrink-0 space-y-1">
          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-2">
            Bảng điều khiển sư phạm
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id || (item.id !== '/teacher' && currentRoute.startsWith(item.id));

            return (
              <button
                key={item.id}
                onClick={() => {
                  audioManager.playClick();
                  onNavigate(item.id);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                    : 'hover:bg-slate-700/60 text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[88px] z-50 bg-slate-900/90 backdrop-blur-md p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    audioManager.playClick();
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-slate-800 text-white font-bold text-sm"
                >
                  <Icon className="w-5 h-5 text-sky-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Main Content View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
