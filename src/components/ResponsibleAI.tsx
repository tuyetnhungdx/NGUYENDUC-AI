import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  AlertTriangle,
  Lock,
  FileCheck,
  Flag,
  UserX,
  HelpCircle,
  CheckCircle,
  Sliders,
} from 'lucide-react';

export const ResponsibleAI: React.FC = () => {
  const { logAction } = useApp();

  const [reportIssueType, setReportIssueType] = useState('sai_kien_thuc');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDetails.trim()) return;
    logAction('AI_REPORT_FILED', reportIssueType, `Báo cáo: "${reportDetails.slice(0, 50)}"`);
    setReportSuccess(true);
    setReportDetails('');
    setTimeout(() => setReportSuccess(false), 4000);
  };

  const principles = [
    {
      title: '1. AI là công cụ hỗ trợ – Không làm thay',
      desc: 'Hệ thống thiết kế theo phương pháp gợi mở Socratic. Học sinh tuyệt đối không sao chép nguyên văn mã nguồn do AI gợi ý làm bài của mình.',
      icon: '🌱',
    },
    {
      title: '2. Bảo vệ dữ liệu cá nhân & Riêng tư',
      desc: 'Tuyệt đối không chia sẻ mật khẩu, số điện thoại, địa chỉ nhà hoặc thông tin nhạy cảm của học sinh lên môi trường học tập.',
      icon: '🔒',
    },
    {
      title: '3. Kiểm chứng thông tin đa chiều',
      desc: 'Mô hình ngôn ngữ có thể có sai sót. Học sinh luôn đối chiếu với Sách giáo khoa Tin học chuẩn của Bộ Giáo dục & Đào tạo.',
      icon: '📖',
    },
    {
      title: '4. Trung thực học thuật & Bản quyền',
      desc: 'Ghi nhận và tôn trọng công sức lao động trí tuệ. Quá trình tự sửa lỗi quan trọng hơn điểm số đối phó tức thời.',
      icon: '⚖️',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-linear-to-r from-blue-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-2 border border-blue-400/30">
        <div className="inline-flex items-center gap-2 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Responsible AI Guidelines</span>
        </div>
        <h1 className="text-2xl font-black">
          Trung tâm Trí tuệ Nhân tạo Có Trách nhiệm & An toàn Số
        </h1>
        <p className="text-xs text-blue-100 max-w-2xl leading-relaxed">
          Xây dựng môi trường giáo dục số nhân văn, liêm chính học thuật và bảo vệ an toàn cho học sinh THPT Nguyễn Dục.
        </p>
      </div>

      {/* 4 Core Ethical Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {principles.map((p, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-2 hover:border-blue-400 transition-all"
          >
            <div className="text-2xl">{p.icon}</div>
            <h3 className="font-extrabold text-sm text-slate-900">{p.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>

      {/* Safety Reporting Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">
              Báo cáo phản hồi AI chưa chính xác hoặc không phù hợp
            </h3>
            <p className="text-xs text-slate-500">
              Nếu phát hiện AI chẩn đoán sai cấu trúc HTML hoặc đưa ra lời khuyên không chuẩn mực, hãy gửi báo cáo để Thầy Cô kiểm tra.
            </p>
          </div>
        </div>

        <form onSubmit={handleReport} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Loại vấn đề</label>
              <select
                value={reportIssueType}
                onChange={(e) => setReportIssueType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-blue-500 bg-white"
              >
                <option value="sai_kien_thuc">AI chẩn đoán sai cú pháp HTML</option>
                <option value="goi_y_chua_ro">Gợi ý quá khó hiểu hoặc mơ hồ</option>
                <option value="lo_dap_an">AI vô tình giải hộ cả bài tập</option>
                <option value="khac">Vấn đề khác</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Chi tiết phản hồi</label>
            <textarea
              rows={3}
              required
              placeholder="Mô tả cụ thể câu trả lời của AI và lý do em thấy chưa hợp lý..."
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-blue-500"
            />
          </div>

          {reportSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Cảm ơn em! Báo cáo đã được chuyển trực tiếp tới Ban Quản trị và Thầy Cô bộ môn Tin học.</span>
            </div>
          )}

          <button
            type="submit"
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
          >
            Gửi báo cáo tới Giáo viên
          </button>
        </form>
      </div>
    </div>
  );
};
