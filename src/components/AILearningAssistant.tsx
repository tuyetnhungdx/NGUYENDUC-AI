import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bot,
  Send,
  Sparkles,
  HelpCircle,
  Lightbulb,
  CheckCircle,
  RotateCcw,
  BookOpen,
  Info,
} from 'lucide-react';
import { aiService } from '../services/aiService';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

export const AILearningAssistant: React.FC = () => {
  const { currentUser, serverHealth, logAction } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: `Chào em ${currentUser.name}! Thầy/Cô Trợ lý AI của THPT Nguyễn Dục rất vui được đồng hành cùng em. Em đang học Tin học 12 đúng không? Em đang gặp băn khoăn ở phần nào (HTML, danh sách, bảng, hay liên kết)? Hãy hỏi thầy/cô nhé!`,
      time: '08:00',
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const quickChips = [
    'Giải thích dễ hiểu hơn',
    'Cho em một gợi ý về thẻ table',
    'Đặt câu hỏi kiểm tra cho em',
    'Kiểm tra cú pháp thẻ ol vs ul',
    'Em vẫn chưa hiểu cách đóng thẻ tr',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsLoading(true);

    logAction('AI_TUTOR_QUESTION', 'AI Learning Assistant', `Học sinh hỏi: "${text.slice(0, 40)}"`);

    // Prepare history
    const historyPayload = messages.map((m) => ({
      role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
      parts: m.text,
    }));

    const response = await aiService.askTutor({
      message: text,
      history: historyPayload,
      context: {
        studentName: currentUser.name,
        className: currentUser.className || '12A1',
        school: 'THPT Nguyễn Dục',
        subject: 'Tin học 12 (GDPT 2018)',
      },
    });

    setIsLoading(false);

    const botMsg: ChatMessage = {
      id: `msg_bot_${Date.now()}`,
      sender: 'assistant',
      text: response.reply,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, botMsg]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-linear-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              AI Learning Assistant – Gia sư Tin học Socratic
            </h2>
            <p className="text-xs text-slate-500">
              Nguyên tắc: "AI không làm thay – AI giúp học sinh tự làm tốt hơn."
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <span className={`w-2 h-2 rounded-full ${serverHealth.hasGeminiKey ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          <span>{serverHealth.hasGeminiKey ? 'Gemini 3.8 Flash' : 'Mô phỏng sư phạm'}</span>
        </div>
      </div>

      {/* Chat Window */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[580px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((m) => {
            const isMe = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-xl ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {!isMe && (
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-1 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed space-y-1 shadow-xs ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <span
                    className={`block text-[10px] text-right mt-1 ${
                      isMe ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-md">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 rounded-bl-xs shadow-xs text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                <span>Trợ lý AI đang tư duy theo phương pháp sư phạm gợi mở...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Chips Bar */}
        <div className="px-4 py-2 bg-slate-100/70 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 shrink-0">
            Gợi ý hỏi:
          </span>
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="shrink-0 px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-[11px] font-medium rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Đặt câu hỏi về cú pháp HTML, cách tạo bảng, danh sách..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-blue-500 text-slate-800"
            />

            <button
              type="submit"
              disabled={isLoading || !inputVal.trim()}
              className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-2xl transition-all shadow-md cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
