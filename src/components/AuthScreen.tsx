import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  GraduationCap,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { Role } from '../types';
import { isSupabaseConfigured } from '../services/supabaseClient';

export const AuthScreen: React.FC = () => {
  const { loginWithCredentials, registerWithCredentials, users } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>('STUDENT');
  const [fullName, setFullName] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isSupabaseReady = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ Tên tài khoản và Mật khẩu.');
      return;
    }

    setIsLoading(true);

    try {
      if (activeTab === 'login') {
        const res = await loginWithCredentials(username, password);
        if (!res.success) {
          setErrorMessage(res.message);
        } else {
          setSuccessMessage(res.message);
        }
      } else {
        const res = await registerWithCredentials(
          username,
          password,
          selectedRole,
          fullName.trim() || undefined
        );
        if (!res.success) {
          setErrorMessage(res.message);
        } else {
          setSuccessMessage(res.message);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick 1-click select preset user
  const handleSelectPreset = (presetUsername: string, presetPass: string) => {
    setActiveTab('login');
    setUsername(presetUsername);
    setPassword(presetPass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Decorative background glows */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Side: Brand & Educational Mission */}
        <div className="lg:col-span-5 text-white space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Nền tảng Học tập Số THPT</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <GraduationCap className="w-7 h-7" />
              </div>
              <span className="text-xs uppercase tracking-widest font-black text-blue-400">
                THPT Nguyễn Dục
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Nguyễn Dục AI Learning Hub
            </h1>
            <p className="text-slate-300 text-sm italic font-medium">
              "AI không làm thay – AI giúp học sinh tự làm tốt hơn."
            </p>
          </div>

          <p className="text-xs text-slate-300/90 leading-relaxed hidden sm:block">
            Không gian học tập tích hợp Trợ lý AI sư phạm 4C (Nhận biết – Thấu hiểu – Sáng tạo – Thích ứng),
            nộp bài trực tuyến an toàn và hệ sinh thái đạo đức số SafeNet AI.
          </p>

          {/* Database status badge */}
          <div className="flex items-center justify-center lg:justify-start gap-2 pt-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Cơ sở dữ liệu Supabase:{' '}
                <strong className={isSupabaseReady ? 'text-emerald-400' : 'text-amber-400'}>
                  {isSupabaseReady ? 'Đã kết nối' : 'Sẵn sàng'}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Card (Username & Password) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
          {/* Tabs: Đăng nhập vs Đăng ký */}
          <div className="flex p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'login'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'register'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Đăng ký tài khoản</span>
            </button>
          </div>

          <div className="space-y-1">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              {activeTab === 'login' ? 'Đăng nhập vào hệ thống' : 'Tạo tài khoản học tập mới'}
            </h2>
            <p className="text-xs text-slate-500">
              {activeTab === 'login'
                ? 'Nhập tên tài khoản và mật khẩu của bạn để truy cập nền tảng.'
                : 'Chỉ cần chọn tên tài khoản và mật khẩu để bắt đầu sử dụng.'}
            </p>
          </div>

          {/* Error & Success Banners */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Tên tài khoản */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tên tài khoản
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder={
                    activeTab === 'login'
                      ? 'Ví dụ: nhung.ttt hoặc maianh'
                      : 'Chọn tên tài khoản của bạn (ví dụ: an.nv)'
                  }
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 font-medium transition-all"
                />
              </div>
            </div>

            {/* 2. Mật khẩu */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 font-medium transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Extra Role selector in Register tab */}
            {activeTab === 'register' && (
              <div className="pt-1 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Họ và tên hiển thị (tùy chọn)
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Nguyễn Văn An"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Vai trò của bạn
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('STUDENT')}
                      className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        selectedRole === 'STUDENT'
                          ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Học sinh</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('TEACHER')}
                      className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        selectedRole === 'TEACHER'
                          ? 'border-purple-500 bg-purple-50 text-purple-700 ring-2 ring-purple-500/20'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Giáo viên</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-extrabold text-sm text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] transition-all shadow-md shadow-blue-600/25 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <span>Đang xử lý...</span>
              ) : activeTab === 'login' ? (
                <>
                  <span>Đăng nhập vào hệ thống</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Hoàn tất tạo tài khoản</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Preset Logins */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-bold uppercase tracking-wider text-slate-400">
                Tài khoản mẫu đăng nhập nhanh
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
                MK: 123
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectPreset('nhung.ttt', '123')}
                className="p-2 rounded-xl border border-slate-200 hover:border-purple-300 bg-slate-50 hover:bg-purple-50/50 text-left transition-all cursor-pointer group"
              >
                <div className="text-[11px] font-bold text-slate-800 truncate group-hover:text-purple-700">
                  Cô Tuyết Nhung
                </div>
                <div className="text-[10px] text-purple-600 font-medium">Giáo viên</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('maianh', '123')}
                className="p-2 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50 hover:bg-blue-50/50 text-left transition-all cursor-pointer group"
              >
                <div className="text-[11px] font-bold text-slate-800 truncate group-hover:text-blue-700">
                  Mai Anh (12A1)
                </div>
                <div className="text-[10px] text-blue-600 font-medium">Học sinh</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('admin', '123')}
                className="p-2 rounded-xl border border-slate-200 hover:border-amber-300 bg-slate-50 hover:bg-amber-50/50 text-left transition-all cursor-pointer group"
              >
                <div className="text-[11px] font-bold text-slate-800 truncate group-hover:text-amber-700">
                  Quản trị BGH
                </div>
                <div className="text-[10px] text-amber-600 font-medium">Quản trị viên</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
