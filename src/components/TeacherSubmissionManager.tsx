import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Search,
  Filter,
  FileText,
  ExternalLink,
  Award,
  Sparkles,
  MessageSquare,
  FileCheck,
  Check,
  Eye,
  Calendar,
  X,
} from 'lucide-react';
import { Submission, User, Assignment } from '../types';
import { formatFileSize } from '../services/supabaseClient';

interface TeacherSubmissionManagerProps {
  assignmentId?: string;
}

export const TeacherSubmissionManager: React.FC<TeacherSubmissionManagerProps> = ({
  assignmentId,
}) => {
  const {
    currentUser,
    assignments,
    submissions,
    users,
    classes,
    teacherConfirmGrade,
    exportSubmissionsCSV,
    logAction,
  } = useApp();

  const currentAssignment =
    assignments.find((a) => a.id === assignmentId) ||
    assignments.find((a) => a.id === 'asg_bai9_html') ||
    assignments[0];

  // Filtering states
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'not_submitted' | 'late' | 'graded'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Grading modal state
  const [selectedSubForGrading, setSelectedSubForGrading] = useState<Submission | null>(null);
  const [gradeInput, setGradeInput] = useState<number>(9.0);
  const [commentInput, setCommentInput] = useState<string>('');
  const [gradeSuccessMsg, setGradeSuccessMsg] = useState<string | null>(null);

  // All students in the target class(es)
  const allStudents = users.filter((u) => u.role === 'STUDENT');

  // Filter students by class
  const filteredStudents = allStudents.filter((stu) => {
    if (selectedClassId !== 'all') {
      const targetClass = classes.find((c) => c.id === selectedClassId);
      if (targetClass && stu.className !== targetClass.name) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        stu.name.toLowerCase().includes(q) ||
        (stu.className || '').toLowerCase().includes(q) ||
        stu.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate statistics
  const assignmentSubmissions = submissions.filter(
    (s) => s.assignmentId === currentAssignment.id
  );

  const studentSubmissionMap = new Map<string, Submission>();
  assignmentSubmissions.forEach((sub) => {
    studentSubmissionMap.set(sub.studentId, sub);
  });

  const totalStudentsCount = filteredStudents.length;
  const submittedCount = filteredStudents.filter((stu) =>
    studentSubmissionMap.has(stu.id) && studentSubmissionMap.get(stu.id)?.status === 'submitted'
  ).length;
  const gradedCount = filteredStudents.filter(
    (stu) => studentSubmissionMap.get(stu.id)?.teacherGrade !== undefined
  ).length;
  const notSubmittedCount = totalStudentsCount - submittedCount;

  // Handler for grading modal
  const openGradingModal = (sub: Submission) => {
    setSelectedSubForGrading(sub);
    setGradeInput(sub.teacherGrade ?? 8.5);
    setCommentInput(
      sub.teacherComment ||
        'Cô ghi nhận sự cố gắng hoàn thiện sản phẩm của em. Các tiêu chí rubric đều đã đạt yêu cầu.'
    );
    setGradeSuccessMsg(null);
  };

  const handleSaveGrade = () => {
    if (!selectedSubForGrading) return;
    teacherConfirmGrade(selectedSubForGrading.id, gradeInput, commentInput);
    setGradeSuccessMsg('✓ Đã lưu điểm và gửi nhận xét cho học sinh thành công!');
    logAction(
      'GRADE_SUBMISSION',
      currentAssignment.title,
      `Chấm điểm cho ${selectedSubForGrading.studentName}: ${gradeInput}đ`
    );
    setTimeout(() => {
      setSelectedSubForGrading(null);
      setGradeSuccessMsg(null);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase">
                Bàn làm việc Giáo viên
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                Giáo viên phụ trách: <strong>Cô Trần Thị Tuyết Nhung</strong>
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              Quản lý nộp bài & Thẩm định sản phẩm: {currentAssignment.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi danh sách học sinh đã nộp, tải tệp sản phẩm, chấm điểm và xuất báo cáo kết quả.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportSubmissionsCSV(selectedClassId)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Xuất kết quả ra Excel (CSV)</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div className="text-2xl font-black text-slate-800">{totalStudentsCount}</div>
            <div className="text-[11px] text-slate-500 font-semibold">Tổng học sinh lớp</div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
            <div className="text-2xl font-black text-emerald-700">{submittedCount}</div>
            <div className="text-[11px] text-emerald-800 font-semibold">
              Đã nộp bài ({totalStudentsCount ? Math.round((submittedCount / totalStudentsCount) * 100) : 0}%)
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
            <div className="text-2xl font-black text-amber-700">{notSubmittedCount}</div>
            <div className="text-[11px] text-amber-800 font-semibold">Chưa nộp bài</div>
          </div>

          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-center">
            <div className="text-2xl font-black text-purple-700">{gradedCount}</div>
            <div className="text-[11px] text-purple-800 font-semibold">Đã chấm & trả bài</div>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Class Filter */}
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:bg-white"
          >
            <option value="all">Tất cả các lớp</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                Lớp {c.name} ({c.subject})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:bg-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="submitted">Đã nộp bài</option>
            <option value="not_submitted">Chưa nộp</option>
            <option value="graded">Đã chấm điểm</option>
          </select>
        </div>

        {/* Search Query */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm tên học sinh..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-blue-500"
          />
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">STT</th>
                <th className="py-3 px-4">Học sinh</th>
                <th className="py-3 px-4">Lớp</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Tệp sản phẩm & Liên kết</th>
                <th className="py-3 px-4">Phiên bản</th>
                <th className="py-3 px-4">Thời gian nộp</th>
                <th className="py-3 px-4">Điểm & Nhận xét</th>
                <th className="py-3 px-4 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((student, idx) => {
                const sub = studentSubmissionMap.get(student.id);
                const hasSubmitted = sub && (sub.status === 'submitted' || sub.status === 'completed');
                const isDraft = sub?.status === 'draft';
                const files = sub?.attachedFiles || [];
                const links = sub?.externalLinks || [];

                // Filter check
                if (statusFilter === 'submitted' && !hasSubmitted) return null;
                if (statusFilter === 'not_submitted' && hasSubmitted) return null;
                if (statusFilter === 'graded' && sub?.teacherGrade === undefined) return null;

                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-medium">{idx + 1}</td>

                    {/* Student Name & Avatar */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{student.name}</div>
                          <div className="text-[10px] text-slate-400">{student.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Class */}
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {student.className || '12A1'}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      {hasSubmitted ? (
                        <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md font-extrabold text-[10px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Đã nộp
                        </span>
                      ) : isDraft ? (
                        <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-md font-extrabold text-[10px] inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Bản nháp
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md font-bold text-[10px]">
                          Chưa nộp
                        </span>
                      )}
                    </td>

                    {/* Attached Files & External Links */}
                    <td className="py-3 px-4">
                      {files.length > 0 || links.length > 0 ? (
                        <div className="space-y-1 max-w-[200px]">
                          {files.map((file) => (
                            <div key={file.id} className="flex items-center justify-between gap-1 text-[11px] bg-slate-50 p-1 rounded border border-slate-200">
                              <span className="truncate font-medium text-slate-700" title={file.fileName}>
                                📄 {file.fileName}
                              </span>
                              {file.storageUrl && (
                                <a
                                  href={file.storageUrl}
                                  download={file.fileName}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 hover:text-blue-800 p-0.5"
                                  title="Tải về tệp"
                                >
                                  <Download className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          ))}
                          {links.map((link) => (
                            <div key={link.id} className="flex items-center gap-1 text-[11px]">
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline truncate flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3 shrink-0" />
                                <span className="truncate">{link.title}</span>
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Không có tệp</span>
                      )}
                    </td>

                    {/* Version */}
                    <td className="py-3 px-4">
                      {sub ? (
                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                          v{sub.currentVersion}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Submission Time */}
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {sub?.submittedAt || (sub?.versions[0]?.submittedAt ? sub.versions[0].submittedAt : '-')}
                    </td>

                    {/* Grade & Comments */}
                    <td className="py-3 px-4">
                      {sub?.teacherGrade !== undefined ? (
                        <div>
                          <span className="font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded text-xs">
                            {sub.teacherGrade}/10
                          </span>
                          {sub.teacherComment && (
                            <p className="text-[10px] text-slate-500 truncate max-w-[120px] mt-0.5" title={sub.teacherComment}>
                              {sub.teacherComment}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Chưa chấm</span>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="py-3 px-4 text-center">
                      {sub ? (
                        <button
                          onClick={() => openGradingModal(sub)}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#2563EB] hover:bg-blue-600 hover:text-white font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          {sub.teacherGrade !== undefined ? 'Sửa điểm' : 'Chấm điểm'}
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Chờ nộp</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grading Modal */}
      {selectedSubForGrading && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900">
                  Chấm điểm & Nhận xét sản phẩm
                </h3>
                <p className="text-slate-500 mt-0.5">
                  Học sinh: <strong>{selectedSubForGrading.studentName}</strong> • Lớp{' '}
                  {selectedSubForGrading.className} (Phiên bản v{selectedSubForGrading.currentVersion})
                </p>
              </div>
              <button
                onClick={() => setSelectedSubForGrading(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Attached files summary */}
            {selectedSubForGrading.attachedFiles && selectedSubForGrading.attachedFiles.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-700">Tệp học sinh đã tải lên:</div>
                <div className="space-y-1">
                  {selectedSubForGrading.attachedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                      <span className="font-semibold text-slate-800">{file.fileName} ({formatFileSize(file.fileSize)})</span>
                      {file.storageUrl && (
                        <a
                          href={file.storageUrl}
                          download={file.fileName}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 font-bold flex items-center gap-1 hover:underline"
                        >
                          <Download className="w-3.5 h-3.5" /> Tải về
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Student Note */}
            {selectedSubForGrading.notes && (
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-blue-900">
                <strong>Ghi chú của học sinh: </strong>
                {selectedSubForGrading.notes}
              </div>
            )}

            {/* Grade Input */}
            <div className="space-y-2">
              <label className="block text-slate-800 font-bold">
                Điểm số đánh giá (Thang điểm 10):
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  max="10"
                  value={gradeInput}
                  onChange={(e) => setGradeInput(parseFloat(e.target.value) || 0)}
                  className="w-28 px-3 py-2 text-base font-black text-purple-700 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                />
                <span className="text-xs text-slate-500">/ 10.00 điểm</span>
              </div>
            </div>

            {/* Comments Input */}
            <div className="space-y-2">
              <label className="block text-slate-800 font-bold">
                Lời nhận xét và hướng dẫn sư phạm:
              </label>
              <textarea
                rows={4}
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Nhập nhận xét chi tiết về sản phẩm, khen ngợi sự tiến bộ và chỉ dẫn hoàn thiện..."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white font-sans"
              />
            </div>

            {gradeSuccessMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{gradeSuccessMsg}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedSubForGrading(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveGrade}
                className="px-6 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer shadow-sm"
              >
                Lưu điểm & Trả bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
