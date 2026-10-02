import React, { useState, useEffect } from 'react';
import { KnowledgeCard } from '../../types';
import { getKnowledgeCards } from '../../services/rewardService';
import { audioManager } from '../../services/audioService';
import { BookOpen, Sparkles, Lightbulb, Calendar, ArrowLeft, Search } from 'lucide-react';

interface NotebookPageProps {
  onBackToCity: () => void;
}

export const NotebookPage: React.FC<NotebookPageProps> = ({ onBackToCity }) => {
  const [cards, setCards] = useState<KnowledgeCard[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getKnowledgeCards().then(setCards);
  }, []);

  const filteredCards = cards.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.keyTakeaway.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.journeyTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        <div className="flex items-center gap-2 bg-indigo-100 text-indigo-800 px-3.5 py-1.5 rounded-2xl font-black text-xs">
          <BookOpen className="w-4 h-4" />
          <span>{cards.length} Thẻ kiến thức đã lưu</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-black uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
            Cẩm nang an toàn giao thông
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">
            📚 SỔ TAY AN TOÀN
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 font-semibold max-w-md">
            Tổng hợp những bài học cốt lõi và mẹo vàng an toàn giúp em tự tin vững bước mỗi ngày!
          </p>
        </div>
        <div className="text-6xl sm:text-7xl animate-bounce">
          📖
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm quy tắc, chặng học hoặc bài học..."
          className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border-2 border-slate-200 focus:outline-hidden focus:border-indigo-500 font-bold text-xs sm:text-sm text-slate-800 shadow-xs"
        />
      </div>

      {/* Cards List */}
      {filteredCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border-3 border-indigo-100 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-800 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  {card.journeyTitle} • Chặng {card.stageOrder}
                </span>
                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(card.unlockedAt).toLocaleDateString('vi-VN')}
                </span>
              </div>

              <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                <span className="text-xl">💡</span>
                <span>{card.title}</span>
              </h3>

              <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200">
                <p className="text-xs sm:text-sm font-black text-amber-950 leading-relaxed">
                  “{card.keyTakeaway}”
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border-4 border-slate-100 space-y-3">
          <div className="text-5xl">🌱</div>
          <h3 className="font-black text-base text-slate-700">
            {cards.length === 0 ? 'Sổ tay của em chưa có thẻ bài nào!' : 'Không tìm thấy thẻ phù hợp'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {cards.length === 0
              ? 'Hãy hoàn thành các chặng học trong Bản Đồ Thành Phố để mở khóa thật nhiều mẹo an toàn bổ ích nhé!'
              : 'Thử tìm kiếm với từ khóa khác xem sao bạn nhé.'}
          </p>
        </div>
      )}
    </div>
  );
};
