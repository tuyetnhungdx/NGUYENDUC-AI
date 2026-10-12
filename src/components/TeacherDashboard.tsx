import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  GraduationCap,
  FileCheck,
  Clock,
  Plus,
  BookOpen,
  Sparkles,
  BarChart3,
  Bot,
  ArrowRight,
  Download,
  CheckCircle,
  AlertCircle,
  FilePlus,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { ClassRoom, RubricItem } from '../types';
import { TeacherSubmissionManager } from './TeacherSubmissionManager';

export const TeacherDashboard: React.FC = () => {
  const {
    currentUser,
    classes,
    assignments,
    submissions,
    addClass,
    createAssignment,
    exportSubmissionsCSV,
    setActiveView,
    setSelectedAssignmentId,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'classes' | 'create_assignment' | 'submissions' | 'manage_submissions'
  >('overview');

  // Form states for creating new class
  const [newClassName, setNewClassName] = useState('');
  const [newSubject, setNewSubject] = useState('Tin học 12');
  const [newGrade, setNewGrade] = useState('12');
  const [newClassDesc, setNewClassDesc] = useState('');
  const [classCreateMsg, setClassCreateMsg] = useState<string | null>(null);

  // Form states for creating new assignment
  const [asgTitle, setAsgTitle] = useState('');
  const [asgClassId, setAsgClassId] = useState(classes[0]?.id || '');
  const [asgDesc, setAsgDesc] = useState('');
  const [asgDueDate, setAsgDueDate] = useState('2024-10-25 23:59');
  const [asgMaxScore, setAsgMaxScore] = useState(10);
  const [asgMaxResubmissions, setAsgMaxResubmissions] = useState(3);
  const [asgAiEnabled, setAsgAiEnabled] = useState(true);
  const [asgCreateMsg, setAsgCreateMsg] = useState<string | null>(null);

  // Metrics
  const totalStudents = classes.reduce((acc, c) => acc + c.studentCount, 0);
  const pendingReviewCount = submissions.filter((s) => !s.isConfirmedByTeacher).length;

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    const code = `ND-${newClassName.toUpperCase()}-TH`;
    addClass({
      name: newClassName,
      subject: newSubject,
      grade: newGrade,
      academicYear: '2024 - 2025',
      code,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      description: newClassDesc || `Lớp ${newClassName} – ${newSubject}`,
      color: '#2563EB',
      bannerGradient: 'from-blue-600 to-indigo-800',
    });
    setClassCreateMsg(`✓ Đã tạo thành công lớp ${newClassName} với mã tham gia: ${code}`);
    setNewClassName('');
    setNewClassDesc('');
    setTimeout(() => setClassCreateMsg(null), 4000);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTitle.trim()) return;
    createAssignment({
      title: asgTitle,
      classId: asgClassId,
      description: asgDesc || 'Thực hành môn Tin học theo rubric hướng dẫn.',
      dueDate: asgDueDate,
      maxScore: asgMaxScore,
      allowedResubmissions: asgMaxResubmissions,
      aiAssistantEnabled: asgAiEnabled,
      aiSupportLevel: 'full',
      rubric: [
        { id: 'r1', name: 'Cấu trúc thẻ HTML5', weight: 25, maxPoints: 2.5, description: 'Đúng chuẩn' },
        { id: 'r2', name: 'Kỹ thuật Danh sách và Bảng', weight: 40, maxPoints: 4.0, description: 'Đạt yêu cầu' },
        { id: 'r3', name: 'Trình bày và thẩm mỹ', weight: 20, maxPoints: 2.0, description: 'Bố cục đẹp' },
        { id: 'r4', name: 'Quá trình tự sửa lỗi 4C', weight: 15, maxPoints: 1.5, description: 'Có tiến bộ' },
      ],
    });
    setAsgCreateMsg(`✓ Đã giao nhiệm vụ "${asgTitle}" thành công!`);
    setAsgTitle('');
    setAsgDesc('');
    setTimeout(() => {
      setAsgCreateMsg(null);
      setActiveTab('overview');
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              Bàn làm việc Giáo viên
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              Giáo viên Tin học • THPT Nguyễn Dục
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Chào Cô Trần Thị Tuyết Nhung
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý tiến trình học tập, giao nhiệm vụ và thẩm định kết quả theo mô hình AI 4C.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveView('teacher_ai')}
            className="px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Bot className="w-4 h-4 text-amber-300" />
            <span>AI Teacher Assistant</span>
          </button>

          <button
            onClick={() => exportSubmissionsCSV()}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Xuất báo cáo CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Tổng số lớp</span>
            <GraduationCap className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{classes.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">12A1, 12A2, 11A1</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Tổng số học sinh</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{totalStudents}</div>
          <div className="text-[11px] text-emerald-600 mt-1">100% tài khoản hoạt động</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Bài tập đang mở</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{assignments.length}</div>
          <div className="text-[11px] text-indigo-600 mt-1">Đã tích hợp Trợ lý AI 4C</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Bài chờ đánh giá</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600 mt-2">{pendingReviewCount}</div>
          <div className="text-[11px] text-amber-700 mt-1">Cần GV xác nhận điểm</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Tổng quan bài nộp' },
          { id: 'manage_submissions', label: 'Quản lý File & Tải sản phẩm' },
          { id: 'create_assignment', label: 'Giao nhiệm vụ mới' },
          { id: 'classes', label: 'Quản lý lớp học' },
          { id: 'submissions', label: 'Thẩm định & Chấm điểm 4C' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Manage Submissions & Supabase Files */}
      {activeTab === 'manage_submissions' && <TeacherSubmissionManager />}

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">
                Danh sách học sinh nộp bài gần đây
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Dữ liệu thời gian thực theo mô hình AI 4C
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Học sinh</th>
                    <th className="px-6 py-3">Lớp</th>
                    <th className="px-6 py-3">Nhiệm vụ</th>
                    <th className="px-6 py-3">Phiên bản</th>
                    <th className="px-6 py-3">Trạng thái AI</th>
                    <th className="px-6 py-3">Điểm GV xác nhận</th>
                    <th className="px-6 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {sub.studentName}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {sub.studentCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {sub.className}
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium">
                        {sub.assignmentTitle}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded">
                          Version {sub.currentVersion}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3" />
                          Đã qua C1, C2, C3
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-purple-700">
                        {sub.isConfirmedByTeacher ? `${sub.teacherGrade} / 10` : 'Chờ xác nhận'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedAssignmentId(sub.assignmentId);
                            setActiveView('reviewer_4c');
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          Xem chi tiết 4C →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Create Assignment */}
      {activeTab === 'create_assignment' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-3xl mx-auto space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="font-black text-lg text-slate-900">
              Giao nhiệm vụ thực hành mới
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tạo bài tập, thiết lập tiêu chí Rubric và cấu hình mức độ hỗ trợ của Trợ lý AI.
            </p>
          </div>

          <form onSubmit={handleCreateAssignment} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Tiêu đề nhiệm vụ *</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Tin học 12 – Bài 10: Biểu mẫu Web (Form HTML)"
                value={asgTitle}
                onChange={(e) => setAsgTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Lớp nhận nhiệm vụ *</label>
                <select
                  value={asgClassId}
                  onChange={(e) => setAsgClassId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-blue-500 bg-white"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} – {c.subject}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Hạn nộp bài</label>
                <input
                  type="text"
                  value={asgDueDate}
                  onChange={(e) => setAsgDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Nội dung yêu cầu nhiệm vụ</label>
              <textarea
                rows={3}
                placeholder="Mô tả mục tiêu thực hành, các thẻ cần dùng..."
                value={asgDesc}
                onChange={(e) => setAsgDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-blue-500"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-800">
                Cấu hình Trợ lý AI 4C cho nhiệm vụ
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={asgAiEnabled}
                    onChange={(e) => setAsgAiEnabled(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Bật Trợ lý AI Chẩn đoán 4C cho học sinh</span>
                </label>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                Khi bật, học sinh sẽ nhận được chẩn đoán cú pháp và gợi ý 3 mức độ sư phạm (không bị lộ đáp án trực tiếp).
              </p>
            </div>

            {asgCreateMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
                {asgCreateMsg}
              </div>
            )}

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Giao nhiệm vụ tới lớp
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Classes Management */}
      {activeTab === 'classes' && (
        <div className="space-y-6">
          {/* Create Class Box */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900">
              Tạo lớp học trực tuyến mới
            </h3>
            <form onSubmit={handleCreateClass} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Tên lớp</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 12A3"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Môn học</label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-blue-500 bg-white"
                >
                  <option value="Tin học 12">Tin học 12</option>
                  <option value="Tin học 11">Tin học 11</option>
                  <option value="Tin học 10">Tin học 10</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Mô tả ngắn</label>
                <input
                  type="text"
                  placeholder="Chuyên đề thiết kế web..."
                  value={newClassDesc}
                  onChange={(e) => setNewClassDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-blue-500"
                />
              </div>

              <button
                type="submit"
                className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Tạo lớp & Cấp mã
              </button>
            </form>

            {classCreateMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200">
                {classCreateMsg}
              </div>
            )}
          </div>

          {/* Classes Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black bg-blue-100 text-blue-800 px-2.5 py-1 rounded-lg">
                    {cls.name}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    Mã: <strong className="text-slate-800">{cls.code}</strong>
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-base text-slate-900">{cls.subject}</h4>
                  <p className="text-xs text-slate-500 mt-1">{cls.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Sĩ số:</span>
                    <strong>{cls.studentCount} học sinh</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Năm học:</span>
                    <strong>{cls.academicYear}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Submissions Review */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          <div className="p-6 bg-purple-50 rounded-2xl border border-purple-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-sm text-purple-950">
                Phê duyệt & Đánh giá quá trình theo mô hình AI 4C
              </h3>
              <p className="text-xs text-purple-800 mt-0.5">
                Nhấn "Xem chi tiết 4C" để so sánh Version 1 vs Version 2 của học sinh và xác nhận điểm chính thức.
              </p>
            </div>

            <button
              onClick={() => setActiveView('reviewer_4c')}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Mở phòng chấm bài 4C</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
