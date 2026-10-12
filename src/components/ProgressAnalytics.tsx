import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  Download,
  Filter,
  CheckCircle,
  Clock,
  Sparkles,
  PieChart as PieIcon,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

export const ProgressAnalytics: React.FC = () => {
  const { classes, assignments, submissions, exportSubmissionsCSV, currentUser } = useApp();

  const [selectedClass, setSelectedClass] = useState('all');

  // Filtered submissions
  const filteredSubmissions = selectedClass === 'all'
    ? submissions
    : submissions.filter((s) => s.classId === selectedClass);

  // 1. Data for Rubric score improvement (Version 1 vs Version 2)
  const scoreImprovementData = [
    { student: 'Trần Thị Mai Anh', v1: 6.0, v2: 9.5, fixedErrors: 2 },
    { student: 'Lê Hoàng Nam', v1: 5.5, v2: 8.5, fixedErrors: 3 },
    { student: 'Phạm Thảo Vy', v1: 7.0, v2: 9.0, fixedErrors: 1 },
    { student: 'Nguyễn Văn Đạt', v1: 5.0, v2: 8.0, fixedErrors: 4 },
    { student: 'Võ Thùy Linh', v1: 6.5, v2: 9.5, fixedErrors: 2 },
  ];

  // 2. Data for Common Error Categories
  const errorCategoriesData = [
    { name: 'Cấu trúc thẻ <table>', count: 18, color: '#2563EB' },
    { name: 'Quên đóng thẻ </tr>', count: 14, color: '#06B6D4' },
    { name: 'Chưa dùng thẻ <ol>', count: 11, color: '#8B5CF6' },
    { name: 'Thiếu DOCTYPE html', count: 6, color: '#F59E0B' },
    { name: 'Lỗi lồng thẻ cấp độ', count: 5, color: '#EF4444' },
  ];

  // 3. Data for Error Resolution Rate
  const resolutionData = [
    { name: 'Đã tự sửa hoàn thành', value: 85, color: '#10B981' },
    { name: 'Đang tiếp tục sửa', value: 15, color: '#F59E0B' },
  ];

  // 4. Submission growth timeline
  const timelineData = [
    { day: 'T2 (07/10)', submissions: 5 },
    { day: 'T3 (08/10)', submissions: 12 },
    { day: 'T4 (09/10)', submissions: 19 },
    { day: 'T5 (10/10)', submissions: 28 },
    { day: 'T6 (11/10)', submissions: 35 },
    { day: 'T7 (12/10)', submissions: 38 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              Báo cáo tiến bộ
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              Đánh giá quá trình theo mô hình AI 4C
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Bảng Thống kê & Minh chứng Tiến bộ Học tập
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dữ liệu trực quan đối chiếu điểm số trước và sau khi học sinh nhận gợi ý sư phạm.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-blue-500"
          >
            <option value="all">Tất cả các lớp</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                Lớp {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => exportSubmissionsCSV(selectedClass === 'all' ? undefined : selectedClass)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Xuất file Excel / CSV (UTF-8 BOM)</span>
          </button>
        </div>
      </div>

      {/* Top 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Tỷ lệ lỗi được sửa thành công
          </div>
          <div className="text-4xl font-black text-emerald-600">85.4%</div>
          <p className="text-xs text-slate-600">
            Học sinh tự khắc phục sau khi nhận chỉ dẫn Mức 2 và Mức 3.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Điểm số cải thiện trung bình
          </div>
          <div className="text-4xl font-black text-blue-600">+3.2 đ</div>
          <p className="text-xs text-slate-600">
            Từ trung bình 5.9 (Lần nộp 1) lên 9.1 (Lần nộp 2).
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Thời gian phản hồi của AI 4C
          </div>
          <div className="text-4xl font-black text-purple-600">&lt; 2.5s</div>
          <p className="text-xs text-slate-600">
            Phản hồi tức thì ngay khi học sinh nộp mã thực hành.
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Score Growth Chart (Version 1 vs Version 2) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Minh chứng tiến bộ: Điểm số Lần 1 vs Lần 2 (Sau hỗ trợ 4C)
              </h3>
              <p className="text-xs text-slate-500">
                So sánh mức điểm ước lượng giữa hai phiên bản nộp của học sinh
              </p>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreImprovementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="student" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val} điểm`, '']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="v1" name="Điểm Lần nộp 1 (Chưa sửa)" fill="#94A3B8" radius={[6, 6, 0, 0]} />
                <Bar dataKey="v2" name="Điểm Lần nộp 2 (Đã sửa theo 4C)" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Pie Chart Resolution Rate */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900">
              Tỷ lệ giải quyết lỗi
            </h3>
            <p className="text-xs text-slate-500">Học sinh tự sửa qua mô hình 4C</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={resolutionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {resolutionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [`${v}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Tự sửa thành công:</span>
              </span>
              <strong className="text-emerald-700 font-bold">85%</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Đang tiếp tục hoàn thiện:</span>
              </span>
              <strong className="text-amber-700 font-bold">15%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Chart: Error Categories Bar Chart */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">
              Thống kê các nhóm lỗi phổ biến trong bài thực hành HTML
            </h3>
            <p className="text-xs text-slate-500">
              Cung cấp dữ liệu để giáo viên điều chỉnh trọng tâm giảng dạy trên lớp
            </p>
          </div>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={errorCategoriesData}
              margin={{ top: 10, right: 30, left: 40, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={140} />
              <Tooltip formatter={(val: any) => [`${val} học sinh gặp lỗi này`, 'Số lượng']} />
              <Bar dataKey="count" fill="#3B82F6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
