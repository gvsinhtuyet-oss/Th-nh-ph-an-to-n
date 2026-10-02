import React, { useState, useEffect } from 'react';
import { Reward, Journey } from '../../types';
import { getInventory } from '../../services/rewardService';
import { getAllJourneys } from '../../services/curriculumService';
import { audioManager } from '../../services/audioService';
import { Backpack, Sparkles, HelpCircle, CheckCircle, Calendar, ArrowLeft } from 'lucide-react';

interface BackpackPageProps {
  onBackToCity: () => void;
}

export const BackpackPage: React.FC<BackpackPageProps> = ({ onBackToCity }) => {
  const [unlockedItems, setUnlockedItems] = useState<Reward[]>([]);
  const [allPossibleItems, setAllPossibleItems] = useState<Reward[]>([]);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    const userItems = await getInventory();
    setUnlockedItems(userItems.filter(i => i.type !== 'knowledge_card'));

    const journeys = await getAllJourneys();
    const catalog: Reward[] = [];
    journeys.forEach(j => {
      j.stages.forEach(s => {
        if (s.reward && s.reward.type !== 'knowledge_card') {
          catalog.push(s.reward);
        }
      });
      if (j.finalBadge) {
        catalog.push({
          id: `final-badge-${j.id}`,
          name: j.finalBadge.name,
          type: 'badge',
          icon: j.finalBadge.icon,
          description: j.finalBadge.description,
          journeyId: j.id,
          stageId: `${j.id}-s7`
        });
      }
    });
    setAllPossibleItems(catalog);
  };

  const unlockedMap = new Map<string, Reward>();
  unlockedItems.forEach(i => unlockedMap.set(i.id, i));

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            audioManager.playClick();
            onBackToCity();
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-sky-50 border-2 border-slate-200 text-slate-700 font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về Bản Đồ Thành Phố</span>
        </button>

        <div className="flex items-center gap-2 bg-emerald-100 text-emerald-800 px-3.5 py-1.5 rounded-2xl font-black text-xs">
          <Backpack className="w-4 h-4" />
          <span>Đã mở: {unlockedItems.length} vật phẩm</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
            Kho lưu trữ chiến lợi phẩm
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">
            🎒 BA LÔ AN TOÀN
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 font-semibold max-w-md">
            Mỗi chặng đường vượt qua, em thu thập thêm các trang bị an toàn và huy hiệu danh dự!
          </p>
        </div>
        <div className="text-6xl sm:text-7xl animate-bounce">
          🎒
        </div>
      </div>

      {/* Grid of Items */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-emerald-100 shadow-md">
        <h2 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
          <span>Tất cả trang bị an toàn</span>
          <span className="text-xs text-slate-500 font-bold">
            (Bấm vào để xem chi tiết)
          </span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {allPossibleItems.slice(0, 35).map((item) => {
            const unlocked = unlockedMap.get(item.id);
            const isUnlocked = Boolean(unlocked);

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (isUnlocked) {
                    audioManager.playClick();
                    setSelectedReward(unlocked!);
                  }
                }}
                className={`p-4 rounded-3xl border-2 flex flex-col items-center justify-center text-center transition-all ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-300 shadow-sm hover:shadow-md hover:scale-105 cursor-pointer'
                    : 'bg-slate-100/70 border-dashed border-slate-300 opacity-50 cursor-not-allowed select-none'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-white shadow-xs flex items-center justify-center text-3xl mb-2">
                  {isUnlocked ? item.icon : '❓'}
                </div>

                <h3 className="font-extrabold text-xs text-slate-800 line-clamp-1">
                  {isUnlocked ? item.name : 'Chưa mở khóa'}
                </h3>

                <span className="text-[10px] font-bold text-slate-500 mt-1">
                  {isUnlocked ? 'Đã thu thập' : 'Cần vượt chặng'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedReward && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 border-4 border-emerald-300 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-5xl shadow-sm">
              {selectedReward.icon}
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Trang bị an toàn
              </span>
              <h3 className="text-lg font-black text-slate-800 mt-1">
                {selectedReward.name}
              </h3>
              <p className="text-xs text-slate-600 font-semibold mt-1">
                {selectedReward.description}
              </p>
            </div>

            {selectedReward.unlockedAt && (
              <div className="bg-slate-50 p-2.5 rounded-2xl text-[11px] font-bold text-slate-500 flex items-center justify-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Nhận ngày: {new Date(selectedReward.unlockedAt).toLocaleDateString('vi-VN')}</span>
              </div>
            )}

            <button
              onClick={() => setSelectedReward(null)}
              className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20"
            >
              Đóng lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
