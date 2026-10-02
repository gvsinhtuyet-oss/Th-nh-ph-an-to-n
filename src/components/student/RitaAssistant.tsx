import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles, HelpCircle, Bot, AlertCircle } from 'lucide-react';
import { askRita } from '../../services/ritaService';
import { audioManager } from '../../services/audioService';

interface RitaAssistantProps {
  grade?: number;
  journeyTitle?: string;
  stageTitle?: string;
  activityPrompt?: string;
  activityCompleted?: boolean;
  attemptCount?: number;
  ritaOfflineHint?: string;
}

interface Message {
  sender: 'rita' | 'student';
  text: string;
  time: string;
  isOffline?: boolean;
}

const QUICK_PROMPTS = [
  '💡 Cho mình một gợi ý',
  '🔍 Giúp mình quan sát',
  '❓ Vì sao điều này nguy hiểm?',
  '🚦 Mình nên làm gì?',
  '🧠 Mình chưa hiểu',
];

export const RitaAssistant: React.FC<RitaAssistantProps> = ({
  grade = 2,
  journeyTitle = 'An toàn giao thông',
  stageTitle,
  activityPrompt,
  activityCompleted = false,
  attemptCount = 0,
  ritaOfflineHint,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'rita',
      text: 'Chào bạn! Mình là RITA. Mình sẽ cùng bạn quan sát, suy nghĩ và tìm cách tham gia giao thông an toàn nhé!',
      time: 'Vừa xong',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    audioManager.playClick();
    const newMsg: Message = {
      sender: 'student',
      text,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setLoading(true);

    try {
      const result = await askRita({
        message: text,
        grade,
        journeyTitle,
        stageTitle,
        activityPrompt,
        activityCompleted,
        attemptCount,
        ritaOfflineHint,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: 'rita',
          text: result.reply,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          isOffline: result.isOffline,
        },
      ]);
      audioManager.playClick();
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'rita',
          text: 'Hiện mình đang ở chế độ offline. Bạn hãy quan sát kỹ các biển báo và hướng dẫn của thầy cô nhé!',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          isOffline: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => {
            audioManager.playClick();
            setIsOpen(true);
          }}
          className="fixed bottom-4 right-4 z-40 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-3 rounded-full shadow-xl shadow-purple-500/30 flex items-center gap-2.5 font-black text-sm transition-all hover:scale-105 active:scale-95 border-2 border-white"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-lg animate-bounce">
            🤖
          </div>
          <span>Hỏi RITA</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      )}

      {/* RITA Chat Window */}
      {isOpen && (
        <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50 w-[calc(100vw-24px)] sm:w-[350px] max-h-[540px] h-[520px] bg-white rounded-3xl shadow-2xl border-4 border-purple-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center text-xl shadow-xs">
                🤖
              </div>
              <div>
                <h3 className="font-black text-sm leading-tight flex items-center gap-1.5">
                  RITA – Hỏi đáp an toàn
                </h3>
                <p className="text-[11px] text-purple-200 font-semibold">Trợ lý giao thông thông minh</p>
              </div>
            </div>
            <button
              onClick={() => {
                audioManager.playClick();
                setIsOpen(false);
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-purple-50/40 text-xs">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.sender === 'student' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'rita' && (
                  <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm shrink-0">
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl p-3 shadow-xs ${
                    msg.sender === 'student'
                      ? 'bg-purple-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-purple-100 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed font-semibold">{msg.text}</p>
                  <div
                    className={`mt-1 text-[10px] flex items-center gap-1 ${
                      msg.sender === 'student' ? 'text-purple-200 justify-end' : 'text-slate-400'
                    }`}
                  >
                    {msg.time}
                    {msg.isOffline && <span className="text-amber-600 font-bold">• Ngoại tuyến</span>}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 items-center text-purple-600 font-bold text-xs">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-xs animate-spin">
                  ✨
                </div>
                <span>RITA đang suy nghĩ gợi ý cho bạn...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Buttons */}
          <div className="p-2 border-t border-purple-100 bg-white flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="shrink-0 px-2.5 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-bold border border-purple-200 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Bạn muốn mình giải đáp gì nào?"
              disabled={loading}
              className="flex-1 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="w-9 h-9 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
