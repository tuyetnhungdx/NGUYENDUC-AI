import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  Bot,
  ChevronDown,
  LogOut,
  Bell,
  CheckCircle,
  Menu,
  X,
  SlidersHorizontal,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    users,
    loginUser,
    activeView,
    setActiveView,
    serverHealth,
    notifications,
  } = useApp();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const dashboardLabel =
    currentUser.role === 'TEACHER'
      ? 'Bàn làm việc GV'
      : currentUser.role === 'ADMIN'
      ? 'Quản trị BGH'
      : 'Bàn học của em';

  const dashboardView =
    currentUser.role === 'TEACHER'
      ? 'teacher_dashboard'
      : currentUser.role === 'ADMIN'
      ? 'admin_dashboard'
      : 'student_dashboard';

  const secondaryNavItems = [
    { id: 'discussions', label: 'Diễn đàn lớp học', icon: MessageSquare, desc: 'Trao đổi & hỏi đáp bài tập' },
    { id: 'analytics', label: 'Tiến bộ & Thống kê', icon: BarChart3, desc: 'Báo cáo & Xuất file CSV' },
    { id: 'responsible_ai', label: 'AI An toàn & Trách nhiệm', icon: ShieldCheck, desc: 'Nguyên tắc sư phạm chuẩn' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/98 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner Notice */}
      <div className="bg-[#1E3A8A] text-white text-xs py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-[#2563EB] text-white text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md">
              EDTECH
            </span>
            <span className="font-semibold text-slate-100">
              Nguyễn Dục AI Learning Hub • <strong>Trường THPT Nguyễn Dục</strong>
            </span>
            <span className="hidden lg:inline text-blue-300">|</span>
            <span className="hidden lg:inline italic text-blue-200">
              "AI không làm thay – AI giúp học sinh tự làm tốt hơn."
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-blue-900/90 px-2.5 py-0.5 rounded-full border border-blue-400/30 text-[11px] text-blue-100 font-medium">
              <span className={`w-2 h-2 rounded-full ${serverHealth.hasGeminiKey ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span>{serverHealth.hasGeminiKey ? 'Gemini 3.8 Flash' : 'AI Offline Engine'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer shrink-0"
            onClick={() => {
              setActiveView('landing');
              setMobileMenuOpen(false);
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-base sm:text-lg text-[#1E293B] tracking-tight leading-tight">
                NGUYỄN DỤC <span className="text-[#2563EB]">AI LEARNING HUB</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Lớp học số thông minh • THPT Nguyễn Dục
              </div>
            </div>
          </div>

          {/* Primary Navigation Items (Desktop - No Horizontal Scrollbar) */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {/* 1. Trang chủ */}
            <button
              onClick={() => setActiveView('landing')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'landing'
                  ? 'bg-blue-50 text-[#2563EB] border border-blue-200 shadow-xs'
                  : 'text-slate-600 hover:text-[#2563EB] hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Trang chủ</span>
            </button>

            {/* 2. Dashboard theo vai trò */}
            <button
              onClick={() => setActiveView(dashboardView)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === dashboardView
                  ? 'bg-blue-50 text-[#2563EB] border border-blue-200 shadow-xs'
                  : 'text-slate-600 hover:text-[#2563EB] hover:bg-slate-50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>{dashboardLabel}</span>
            </button>

            {/* 3. Nộp bài & AI 4C - CORE PROMINENT HIGHLIGHT */}
            <button
              onClick={() => setActiveView('reviewer_4c')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer ${
                activeView === 'reviewer_4c'
                  ? 'bg-[#2563EB] text-white shadow-blue-500/30'
                  : 'bg-blue-100/90 text-[#1E3A8A] hover:bg-[#2563EB] hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Nộp bài & AI 4C</span>
              <span className="bg-amber-400 text-blue-950 text-[9px] font-black px-1.5 py-0.2 rounded-md uppercase">
                Trọng tâm
              </span>
            </button>

            {/* 4. SAFENET AI – LÁ CHẮN CÔNG DÂN SỐ */}
            <button
              onClick={() => setActiveView('safenet_ai')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeView === 'safenet_ai'
                  ? 'bg-teal-50 text-teal-800 border border-teal-400 shadow-xs ring-1 ring-teal-500/20'
                  : 'text-slate-600 hover:text-teal-700 hover:bg-teal-50/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>SafeNet AI</span>
              <span className="bg-teal-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-md uppercase">
                Lá chắn số
              </span>
            </button>

            {/* 5. AI Gia sư */}
            <button
              onClick={() => setActiveView('tutor_chat')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'tutor_chat'
                  ? 'bg-blue-50 text-[#2563EB] border border-blue-200 shadow-xs'
                  : 'text-slate-600 hover:text-[#2563EB] hover:bg-slate-50'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>AI Gia sư</span>
            </button>

            {/* 5. More Menu Dropdown (Diễn đàn, Thống kê, An toàn) */}
            <div className="relative">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  secondaryNavItems.some((item) => item.id === activeView)
                    ? 'bg-blue-50 text-[#2563EB] border border-blue-200'
                    : 'text-slate-600 hover:text-[#2563EB] hover:bg-slate-50'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Tiện ích & Khác</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showMoreMenu && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in">
                  {secondaryNavItems.map((item) => {
                    const Icon = item.icon;
                    const isSelected = activeView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveView(item.id);
                          setShowMoreMenu(false);
                        }}
                        className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected ? 'bg-blue-50 text-[#2563EB]' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold">{item.label}</div>
                          <div className="text-[10px] text-slate-500">{item.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Right Section: Notifications & User Profile */}
          <div className="flex items-center gap-2">
            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Thông báo"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadNotifs}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-sm text-slate-800">Thông báo học tập</span>
                    <span className="text-xs text-blue-600 hover:underline cursor-pointer">Đã đọc</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto mt-2">
                    {notifications.map((n) => (
                      <div key={n.id} className="py-2.5 px-1 hover:bg-slate-50 rounded-lg text-xs">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{n.title}</span>
                        </div>
                        <p className="text-slate-600 mt-1 pl-5 text-[11px] leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-slate-400 pl-5 block mt-0.5">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & Demo Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2.5 p-1.5 pr-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-all text-left cursor-pointer"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-xl object-cover ring-2 ring-blue-500/20"
                />
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1.5">
                    <span>{currentUser.name}</span>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.2 rounded-md uppercase ${
                        currentUser.role === 'TEACHER'
                          ? 'bg-purple-100 text-purple-700'
                          : currentUser.role === 'ADMIN'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {currentUser.role === 'TEACHER' ? 'Giáo viên' : currentUser.role === 'ADMIN' ? 'BGH' : 'Học sinh'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {currentUser.role === 'TEACHER' ? 'Giáo viên Tin học' : currentUser.className ? `Lớp ${currentUser.className}` : currentUser.school}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 ml-0.5" />
              </button>

              {/* Role Dropdown */}
              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in">
                  <div className="px-3 py-2 bg-slate-50 rounded-xl mb-2">
                    <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      Chuyển đổi góc nhìn vai trò
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Trải nghiệm giữa Học sinh, Giáo viên và Quản trị.
                    </p>
                  </div>

                  <div className="space-y-1">
                    {users.map((u) => {
                      const isCurrent = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            loginUser(u);
                            setShowRoleDropdown(false);
                          }}
                          className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-colors cursor-pointer ${
                            isCurrent ? 'bg-blue-50 text-[#2563EB] font-bold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold truncate flex items-center justify-between">
                              <span>{u.name}</span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                  u.role === 'TEACHER'
                                    ? 'bg-purple-100 text-purple-700'
                                    : u.role === 'ADMIN'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {u.role}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {u.role === 'TEACHER' ? 'Giáo viên Tin học' : u.className ? `Lớp ${u.className}` : u.school}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between px-2">
                    <button
                      onClick={() => {
                        setActiveView('landing');
                        setShowRoleDropdown(false);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Về trang chủ
                    </button>
                    <button
                      onClick={() => {
                        setActiveView('responsible_ai');
                        setShowRoleDropdown(false);
                      }}
                      className="text-xs text-[#2563EB] font-semibold hover:underline"
                    >
                      AI An toàn & Trách nhiệm →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 px-2 border-t border-slate-200 bg-white space-y-1.5 animate-in fade-in">
            <button
              onClick={() => {
                setActiveView('landing');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-left ${
                activeView === 'landing' ? 'bg-blue-50 text-[#2563EB]' : 'text-slate-700'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Trang chủ</span>
            </button>

            <button
              onClick={() => {
                setActiveView(dashboardView);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-left ${
                activeView === dashboardView ? 'bg-blue-50 text-[#2563EB]' : 'text-slate-700'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>{dashboardLabel}</span>
            </button>

            <button
              onClick={() => {
                setActiveView('reviewer_4c');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-black bg-[#2563EB] text-white shadow-xs"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Nộp bài & AI 4C</span>
              </div>
              <span className="bg-amber-400 text-blue-950 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                Trọng tâm
              </span>
            </button>

            <button
              onClick={() => {
                setActiveView('safenet_ai');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-left ${
                activeView === 'safenet_ai' ? 'bg-teal-50 text-teal-800' : 'text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>SafeNet AI – Lá chắn số</span>
              </div>
              <span className="bg-teal-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                Mới
              </span>
            </button>

            <button
              onClick={() => {
                setActiveView('tutor_chat');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-left ${
                activeView === 'tutor_chat' ? 'bg-blue-50 text-[#2563EB]' : 'text-slate-700'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>AI Gia sư học tập</span>
            </button>

            <button
              onClick={() => {
                setActiveView('discussions');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-left ${
                activeView === 'discussions' ? 'bg-blue-50 text-[#2563EB]' : 'text-slate-700'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Diễn đàn thảo luận</span>
            </button>

            <button
              onClick={() => {
                setActiveView('analytics');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-left ${
                activeView === 'analytics' ? 'bg-blue-50 text-[#2563EB]' : 'text-slate-700'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Tiến bộ & Thống kê</span>
            </button>

            <button
              onClick={() => {
                setActiveView('responsible_ai');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-left ${
                activeView === 'responsible_ai' ? 'bg-blue-50 text-[#2563EB]' : 'text-slate-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>AI An toàn & Trách nhiệm</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
