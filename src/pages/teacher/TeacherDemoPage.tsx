import React from 'react';
import { audioManager } from '../../services/audioService';
import { launchCelebrationFireworks } from '../../utils/fireworks';
import { 
  Presentation, 
  MapPin, 
  Play, 
  Bot, 
  WifiOff, 
  Backpack, 
  Sparkles, 
  RotateCcw,
  CheckCircle2,
  Award
} from 'lucide-react';

interface DemoProps {
  onNavigateStudent: (route: string) => void;
}

export const TeacherDemoPage: React.FC<DemoProps> = ({ onNavigateStudent }) => {
  const handleLaunchFireworks = () => {
    audioManager.playVictory();
    launchCelebrationFireworks(4000);
  };

  const handleResetDemoState = () => {
    audioManager.playClick();
    localStorage.removeItem('tpat_progress_g2-l2');
    alert('Đã thiết lập lại dữ liệu bài Demo (Lớp 2 - Đi bộ qua đường an toàn) về trạng thái ban đầu!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div>
        <h2 className="text-2xl font-black text-slate-800">
          🎤 Chế Độ Trình Diễn Lớp Học (Presentation Mode)
        </h2>
        <p className="text-xs text-slate-500 font-bold mt-0.5">
          Các phím tắt nhanh phục vụ giáo viên giảng dạy trên máy chiếu hoặc tivi thông minh.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Mở Thành Phố */}
        <div
          onClick={() => {
            audioManager.playClick();
            onNavigateStudent('/');
          }}
          className="bg-white rounded-3xl p-5 border-2 border-slate-200 hover:border-sky-400 hover:shadow-lg transition-all cursor-pointer space-y-2 group"
        >
          <div className="text-4xl group-hover:scale-110 transition-transform">🏙️</div>
          <h3 className="font-black text-base text-slate-800">Mở Bản Đồ Thành Phố</h3>
          <p className="text-xs text-slate-500 font-semibold">
            Chiếu tổng quan Thành Phố An Toàn và lựa chọn khối lớp 1–5.
          </p>
        </div>

        {/* 2. Bắt Đầu Journey Demo */}
        <div
          onClick={() => {
            audioManager.playClick();
            onNavigateStudent('/journey/g2-l2');
          }}
          className="bg-white rounded-3xl p-5 border-2 border-amber-300 hover:border-amber-500 hover:shadow-lg transition-all cursor-pointer space-y-2 group bg-amber-50/30"
        >
          <div className="text-4xl group-hover:scale-110 transition-transform">🚸</div>
          <h3 className="font-black text-base text-slate-800">Hành Trình Demo (Lớp 2)</h3>
          <p className="text-xs text-slate-500 font-semibold">
            Mở bài học “Đi bộ qua đường an toàn” (7 chặng hoàn chỉnh).
          </p>
        </div>

        {/* 3. Mở Ba Lô An Toàn */}
        <div
          onClick={() => {
            audioManager.playClick();
            onNavigateStudent('/inventory');
          }}
          className="bg-white rounded-3xl p-5 border-2 border-slate-200 hover:border-emerald-400 hover:shadow-lg transition-all cursor-pointer space-y-2 group"
        >
          <div className="text-4xl group-hover:scale-110 transition-transform">🎒</div>
          <h3 className="font-black text-base text-slate-800">Kho Ba Lô An Toàn</h3>
          <p className="text-xs text-slate-500 font-semibold">
            Trình chiếu bộ sưu tập vật phẩm và trang bị bảo hộ giao thông.
          </p>
        </div>

        {/* 4. Sổ Tay An Toàn */}
        <div
          onClick={() => {
            audioManager.playClick();
            onNavigateStudent('/notebook');
          }}
          className="bg-white rounded-3xl p-5 border-2 border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all cursor-pointer space-y-2 group"
        >
          <div className="text-4xl group-hover:scale-110 transition-transform">📚</div>
          <h3 className="font-black text-base text-slate-800">Sổ Tay Ghi Nhớ Vàng</h3>
          <p className="text-xs text-slate-500 font-semibold">
            Các thẻ kiến thức cốt lõi đúc kết sau các chặng học.
          </p>
        </div>

        {/* 5. Pháo Hoa Chúc Mừng */}
        <div
          onClick={handleLaunchFireworks}
          className="bg-white rounded-3xl p-5 border-2 border-slate-200 hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer space-y-2 group"
        >
          <div className="text-4xl group-hover:scale-110 transition-transform">🎉</div>
          <h3 className="font-black text-base text-slate-800">Bắn Pháo Hoa Chiến Thắng</h3>
          <p className="text-xs text-slate-500 font-semibold">
            Hiệu ứng hạt pháo hoa toàn màn hình khích lệ tinh thần học sinh.
          </p>
        </div>

        {/* 6. Reset Demo */}
        <div
          onClick={handleResetDemoState}
          className="bg-white rounded-3xl p-5 border-2 border-slate-200 hover:border-rose-400 hover:shadow-lg transition-all cursor-pointer space-y-2 group"
        >
          <div className="text-4xl group-hover:scale-110 transition-transform">♻️</div>
          <h3 className="font-black text-base text-slate-800">Thiết Lập Lại Demo</h3>
          <p className="text-xs text-slate-500 font-semibold">
            Xóa tiến trình bài Lớp 2 để diễn tập lại từ Chặng 1 cho tiết học mới.
          </p>
        </div>
      </div>
    </div>
  );
};
