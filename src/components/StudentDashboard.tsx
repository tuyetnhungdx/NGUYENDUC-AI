import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Sparkles,
  TrendingUp,
  Award,
  Users,
  Plus,
  ArrowRight,
  Bot,
  MessageSquare,
  BarChart3,
  ExternalLink,
  ChevronRight,
  Bell,
  ShieldCheck,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const {
    currentUser,
    assignments,
    submissions,
    classes,
    joinClassByCode,
    setActiveView,
    setSelectedAssignmentId,
  } = useApp();

  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joinMessage, setJoinMessage] = useState<string | null>(null);

  // Student metrics
  const mySubmissions = submissions.filter((s) => s.studentId === currentUser.id);
  const completedCount = mySubmissions.filter((s) => s.status === 'completed').length;
  const inProgressCount = assignments.length - completedCount;

  // Joined classes
  const myClass = classes.find((c) => c.id === currentUser.classId) || classes[0];

  const handleJoinClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    const res = joinClassByCode(joinCodeInput);
    setJoinMessage(res.message);
    setJoinCodeInput('');
    setTimeout(() => setJoinMessage(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Welcome Profile Banner */}
      <div className="bg-linear-to-r from-blue-700 via-blue-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/30 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-blue-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Học sinh
                </span>
                <span className="text-blue-200 text-xs font-semibold">
                  Mã số: {mySubmissions[0]?.studentCode || 'HS1201'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black mt-0.5">{currentUser.name}</h1>
              <p className="text-xs text-blue-100 mt-0.5">
                Lớp {currentUser.className || myClass.name} • Trường THPT Nguyễn Dục • GVCN: Cô Trần Thị Tuyết Nhung
              </p>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveView('reviewer_4c')}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-blue-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Vào nộp bài AI 4C</span>
            </button>

            <button
              onClick={() => setActiveView('tutor_chat')}
              className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs backdrop-blur-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4 text-cyan-300" />
              <span>Hỏi Trợ lý AI</span>
            </button>
          </div>
        </div>

        {/* Quick Stat Counter Bar */}
        <div className="mt-6 pt-6 border-t border-blue-500/40 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-black text-amber-300">
              {assignments.length}
            </div>
            <div className="text-[11px] text-blue-100 font-medium mt-0.5">Nhiệm vụ được giao</div>
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {mySubmissions.length}
            </div>
            <div className="text-[11px] text-blue-100 font-medium mt-0.5">Bài đã nộp</div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-300">
              {completedCount}
            </div>
            <div className="text-[11px] text-blue-100 font-medium mt-0.5">Đã hoàn thành</div>
          </div>
          <div>
            <div className="text-2xl font-black text-cyan-300">
              {mySubmissions[0]?.teacherGrade ? `${mySubmissions[0].teacherGrade}/10` : '9.5/10'}
            </div>
            <div className="text-[11px] text-blue-100 font-medium mt-0.5">Điểm thực hành cao nhất</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Assignments and Class Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Assignments List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Danh sách bài tập & Nhiệm vụ thực hành
              </h2>
              <p className="text-xs text-slate-500">
                Hoàn thiện bài tập và sử dụng quy trình AI 4C để tự sửa lỗi nâng cao kết quả.
              </p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              {assignments.length} bài tập
            </span>
          </div>

          <div className="space-y-4">
            {assignments.map((asg) => {
              const sub = mySubmissions.find((s) => s.assignmentId === asg.id);
              const isCompleted = sub?.status === 'completed';
              const isSubmitted = sub?.status === 'submitted';
              const isDraft = sub?.status === 'in_progress';

              return (
                <div
                  key={asg.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 p-6 shadow-xs hover:shadow-lg transition-all space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {asg.isDemo && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                            Tình huống Demo Trọng tâm
                          </span>
                        )}
                        <span className="text-xs font-semibold text-slate-500">
                          {asg.subject} • Lớp {asg.className}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-base text-slate-900">
                        {asg.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {asg.description}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isCompleted ? (
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Hoàn thành ({sub.teacherGrade}đ)
                        </span>
                      ) : isSubmitted ? (
                        <span className="bg-blue-100 text-blue-800 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Đã nộp (V{sub.currentVersion})
                        </span>
                      ) : isDraft ? (
                        <span className="bg-amber-100 text-amber-800 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Cần chỉnh sửa
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">
                          Chưa nộp
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rubric Preview & Due Date */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                    <div className="flex items-center gap-4">
                      <span>Hạn nộp: <strong className="text-slate-700">{asg.dueDate}</strong></span>
                      <span>Rubric: <strong className="text-slate-700">{asg.rubric.length} tiêu chí</strong></span>
                      <span>AI 4C: <strong className="text-emerald-600">Đã bật</strong></span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedAssignmentId(asg.id);
                        setActiveView('reviewer_4c');
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>{sub ? 'Xem phản hồi & Nộp lại' : 'Làm bài & Nộp AI'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 4 Cols: Class info & Join Class */}
        <div className="lg:col-span-4 space-y-6">
          {/* SafeNet AI Challenge Widget */}
          <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 rounded-2xl p-5 text-white shadow-md border border-teal-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal-400 text-slate-950">
                Thử thách An toàn số
              </span>
              <ShieldCheck className="w-5 h-5 text-teal-300" />
            </div>

            <div>
              <h3 className="font-extrabold text-sm text-white">
                SAFENET AI – LÁ CHẮN SỐ
              </h3>
              <p className="text-xs text-teal-100 mt-1 leading-relaxed">
                Rèn luyện kỹ năng nhận diện lừa đảo mạng, cuộc gọi Deepfake và tin giả mạo.
              </p>
            </div>

            <button
              onClick={() => setActiveView('safenet_ai')}
              className="w-full py-2.5 bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Vào Đấu trường SafeNet AI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Join Class by Code Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              <h3 className="font-extrabold text-sm text-slate-900">
                Tham gia lớp học mới
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Nhập mã tham gia do giáo viên bộ môn cung cấp (Ví dụ: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-blue-600 font-bold">ND-12A1-TH</code>).
            </p>

            <form onSubmit={handleJoinClass} className="space-y-2">
              <input
                type="text"
                placeholder="Nhập mã lớp..."
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs uppercase font-mono tracking-wider focus:outline-blue-500"
              />
              <button
                type="submit"
                className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Gia nhập lớp học
              </button>
            </form>

            {joinMessage && (
              <div className="p-2.5 bg-blue-50 text-blue-800 text-xs rounded-lg font-medium border border-blue-200">
                {joinMessage}
              </div>
            )}
          </div>

          {/* Current Class Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">
                Thông tin lớp: {myClass.name}
              </h3>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                Mã: {myClass.code}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {myClass.description}
            </p>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Giáo viên phụ trách:</span>
                <strong className="text-slate-800">{myClass.teacherName}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Sĩ số lớp:</span>
                <strong className="text-slate-800">{myClass.studentCount} học sinh</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Năm học:</span>
                <strong className="text-slate-800">{myClass.academicYear}</strong>
              </div>
            </div>

            {/* Announcements */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-blue-600" />
                <span>Thông báo mới nhất từ Cô</span>
              </div>
              {myClass.announcements.slice(0, 1).map((ann) => (
                <div key={ann.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div className="font-semibold text-slate-800">{ann.title}</div>
                  <p className="text-[11px] text-slate-600 mt-1">{ann.content}</p>
                  <div className="text-[10px] text-slate-400 mt-1">{ann.createdAt}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
