import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldAlert,
  Users,
  Settings,
  Activity,
  RotateCcw,
  CheckCircle,
  Lock,
  Cpu,
  BarChart2,
} from 'lucide-react';
import { Role } from '../types';

export const AdminDashboard: React.FC = () => {
  const {
    users,
    classes,
    auditLogs,
    resetToInitialDemo,
    loginUser,
    serverHealth,
    logAction,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'logs' | 'ai_config'>('users');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Daily AI quota
  const [dailyQuota, setDailyQuota] = useState(50);
  const [saveQuotaMsg, setSaveQuotaMsg] = useState<string | null>(null);

  const handleReset = () => {
    if (window.confirm('Bạn có chắc muốn khôi phục dữ liệu demo ban đầu phục vụ bài thi?')) {
      resetToInitialDemo();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  const handleSaveQuota = () => {
    logAction('UPDATE_AI_CONFIG', 'Daily Quota', `Đặt hạn mức ${dailyQuota} lượt/ngày/học sinh`);
    setSaveQuotaMsg('✓ Đã cập nhật hạn mức sử dụng AI thành công!');
    setTimeout(() => setSaveQuotaMsg(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              Quản trị viên Hệ thống
            </span>
            <span className="text-xs text-slate-400">
              Ban Giám hiệu • THPT Nguyễn Dục
            </span>
          </div>
          <h1 className="text-2xl font-black mt-1">
            Trung tâm Điều hành & Quản trị Toàn diện
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Quản trị người dùng, giám sát nhật ký bảo mật (Audit Logs) và thiết lập thông số AI.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Khôi phục dữ liệu Demo gốc</span>
        </button>
      </div>

      {resetSuccess && (
        <div className="p-4 bg-emerald-100 text-emerald-800 rounded-2xl text-xs font-bold border border-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Đã hoàn tất khôi phục toàn bộ trạng thái demo ban đầu của hệ thống!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'users', label: 'Quản lý Người dùng & Quyền' },
          { id: 'logs', label: 'Nhật ký Hoạt động (Audit Logs)' },
          { id: 'ai_config', label: 'Cấu hình AI & An toàn' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Users */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">
              Danh sách tài khoản ({users.length} người dùng)
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Phân quyền theo vai trò RBAC
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Họ và tên</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Vai trò</th>
                  <th className="px-6 py-3">Lớp / Đơn vị</th>
                  <th className="px-6 py-3 text-right">Chuyển vai trò</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2.5">
                      <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-lg object-cover" />
                      <span>{u.name}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-[11px]">{u.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          u.role === 'ADMIN'
                            ? 'bg-amber-100 text-amber-800'
                            : u.role === 'TEACHER'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {u.className ? `Lớp ${u.className}` : u.school}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => loginUser(u)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        Đăng nhập vào vai này →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">
              Nhật ký kiểm toán hệ thống (Audit Logs)
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Ghi nhận các thao tác quan trọng
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold text-[10px] border-b border-slate-200 font-sans">
                <tr>
                  <th className="px-6 py-3">Thời gian</th>
                  <th className="px-6 py-3">Người dùng</th>
                  <th className="px-6 py-3">Hành động</th>
                  <th className="px-6 py-3">Đối tượng</th>
                  <th className="px-6 py-3">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-3 text-slate-400">{log.timestamp}</td>
                    <td className="px-6 py-3 font-bold text-slate-800">{log.userName}</td>
                    <td className="px-6 py-3 text-blue-600 font-semibold">{log.action}</td>
                    <td className="px-6 py-3 text-slate-700">{log.target}</td>
                    <td className="px-6 py-3 text-slate-500 font-sans">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: AI Config */}
      {activeTab === 'ai_config' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-2xl space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-extrabold text-base text-slate-900">
              Cấu hình Trợ lý AI và Giới hạn sử dụng
            </h3>
            <p className="text-xs text-slate-500">
              Kiểm soát lưu lượng và thiết lập ranh giới sư phạm an toàn.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Hạn mức số lượt hỏi Trợ lý AI (lượt/học sinh/ngày):
              </label>
              <input
                type="number"
                min="5"
                max="200"
                value={dailyQuota}
                onChange={(e) => setDailyQuota(parseInt(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-bold focus:outline-blue-500"
              />
              <span className="text-[11px] text-slate-400">
                Ngăn chặn học sinh lạm dụng hoặc hỏi liên tục mà không suy nghĩ.
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Mô hình Ngôn ngữ Server-Side:
              </label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 flex items-center justify-between">
                <span>{serverHealth.model}</span>
                <span className="text-emerald-600 font-bold font-sans">
                  {serverHealth.hasGeminiKey ? 'Đã kích hoạt' : 'Chế độ Cục bộ'}
                </span>
              </div>
            </div>

            {saveQuotaMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
                {saveQuotaMsg}
              </div>
            )}

            <button
              onClick={handleSaveQuota}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Lưu thiết lập
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
