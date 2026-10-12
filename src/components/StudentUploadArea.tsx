import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Upload,
  FileText,
  FileCode,
  Image,
  Archive,
  Link,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  Database,
  ExternalLink as ExternalLinkIcon,
  Download,
  Eye,
  RefreshCw,
  FolderOpen,
  Info,
  Calendar,
  Layers,
  Send,
  Save,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Assignment, SubmissionFile, ExternalLink as ExternalLinkType, Submission } from '../types';
import {
  uploadSubmissionFile,
  formatFileSize,
  isSupabaseConfigured,
  getSupabaseConfig,
  setCustomSupabaseConfig,
  testSupabaseConnection,
} from '../services/supabaseClient';

interface StudentUploadAreaProps {
  onAnalyzeWith4C?: (htmlContent?: string) => void;
  selectedAssignmentId?: string | null;
  onSelectAssignment?: (id: string) => void;
}

export const StudentUploadArea: React.FC<StudentUploadAreaProps> = ({
  onAnalyzeWith4C,
  selectedAssignmentId,
  onSelectAssignment,
}) => {
  const {
    currentUser,
    assignments,
    submissions,
    submitAssignmentFiles,
    setActiveView,
    logAction,
  } = useApp();

  // Active assignment
  const currentAssignment: Assignment =
    assignments.find((a) => a.id === selectedAssignmentId) ||
    assignments.find((a) => a.id === 'asg_bai9_html') ||
    assignments[0];

  // Find existing student submission
  const existingSubmission: Submission | undefined = submissions.find(
    (s) => s.assignmentId === currentAssignment.id && s.studentId === currentUser.id
  );

  // File upload states
  const [fileList, setFileList] = useState<SubmissionFile[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<
    Array<{ name: string; size: number; progress: number; error?: string }>
  >([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // External links
  const [externalLinks, setExternalLinks] = useState<ExternalLinkType[]>([]);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkType, setNewLinkType] = useState<'google_drive' | 'canva' | 'video' | 'other'>(
    'google_drive'
  );
  const [showAddLink, setShowAddLink] = useState(false);

  // Notes
  const [notes, setNotes] = useState('');

  // Status & Feedback
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Supabase modal configuration
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState('');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState('');
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(isSupabaseConfigured());
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseTestFeedback, setSupabaseTestFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Populate from existing submission when assignment changes
  useEffect(() => {
    if (existingSubmission) {
      setFileList(existingSubmission.attachedFiles || []);
      setExternalLinks(existingSubmission.externalLinks || []);
      setNotes(existingSubmission.notes || '');
    } else {
      setFileList([]);
      setExternalLinks([]);
      setNotes('');
    }
    setSubmitSuccessMsg(null);
    setErrorMessage(null);
  }, [currentAssignment.id, existingSubmission?.id, existingSubmission?.currentVersion]);

  // Check Supabase connection
  useEffect(() => {
    const config = getSupabaseConfig();
    setSupabaseUrlInput(config.url);
    setSupabaseKeyInput(config.key);
    setIsSupabaseConnected(isSupabaseConfigured());
  }, []);

  // Allowed extensions for this assignment
  const allowedExtensions = currentAssignment.allowedExtensions || [
    'pdf',
    'docx',
    'pptx',
    'xlsx',
    'jpg',
    'png',
    'html',
    'css',
    'js',
    'py',
    'zip',
  ];
  const maxMb = currentAssignment.maxFileSizeMb || 20;

  // Process files selected from input or drag-and-drop
  const handleFilesChosen = async (files: FileList | File[]) => {
    setErrorMessage(null);
    const filesArray = Array.from(files);

    if (filesArray.length === 0) return;

    for (const file of filesArray) {
      // 1. Check extension
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (!allowedExtensions.includes(ext)) {
        setErrorMessage(
          `Tệp "${file.name}" không hợp lệ. Chỉ chấp nhận các định dạng: ${allowedExtensions.join(', ')}.`
        );
        continue;
      }

      // 2. Check size (max 20MB)
      if (file.size > maxMb * 1024 * 1024) {
        setErrorMessage(
          `Tệp "${file.name}" (${formatFileSize(file.size)}) vượt quá dung lượng tối đa ${maxMb}MB.`
        );
        continue;
      }

      // Add to uploading queue
      setUploadingFiles((prev) => [
        ...prev,
        { name: file.name, size: file.size, progress: 10 },
      ]);

      try {
        // Upload to real Supabase Storage or server storage
        const uploadedFile = await uploadSubmissionFile(
          file,
          {
            studentId: currentUser.id,
            studentName: currentUser.name,
            classId: currentUser.classId || 'class_12a1',
            assignmentId: currentAssignment.id,
          },
          (progress) => {
            setUploadingFiles((prev) =>
              prev.map((item) =>
                item.name === file.name ? { ...item, progress } : item
              )
            );
          }
        );

        // Remove from uploading queue and add to fileList
        setUploadingFiles((prev) => prev.filter((item) => item.name !== file.name));
        setFileList((prev) => [...prev, uploadedFile]);

        logAction(
          'UPLOAD_SUBMISSION_FILE',
          currentAssignment.title,
          `Đã upload ${file.name} (${formatFileSize(file.size)})`
        );
      } catch (err: any) {
        setUploadingFiles((prev) =>
          prev.map((item) =>
            item.name === file.name
              ? { ...item, error: err.message || 'Lỗi tải tệp' }
              : item
          )
        );
        setErrorMessage(err.message || 'Có lỗi xảy ra khi tải tệp lên hệ thống.');
      }
    }
  };

  // Remove file
  const handleRemoveFile = (fileId: string) => {
    setFileList((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Add external link
  const handleAddExternalLink = () => {
    if (!newLinkUrl.trim()) return;

    let validUrl = newLinkUrl.trim();
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }

    const newLink: ExternalLinkType = {
      id: `link_${Date.now()}`,
      title: newLinkTitle.trim() || validUrl,
      url: validUrl,
      type: newLinkType,
    };

    setExternalLinks((prev) => [...prev, newLink]);
    setNewLinkTitle('');
    setNewLinkUrl('');
    setShowAddLink(false);
  };

  // Remove external link
  const handleRemoveLink = (linkId: string) => {
    setExternalLinks((prev) => prev.filter((l) => l.id !== linkId));
  };

  // Submit or Save Draft
  const handlePerformSubmit = (isDraft: boolean) => {
    if (fileList.length === 0 && externalLinks.length === 0 && !isDraft) {
      setErrorMessage('Vui lòng tải lên ít nhất một tệp sản phẩm hoặc đính kèm liên kết trước khi nộp.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const result = submitAssignmentFiles({
        assignmentId: currentAssignment.id,
        files: fileList,
        externalLinks,
        notes: notes.trim(),
        isDraft,
      });

      const now = new Date().toLocaleString('vi-VN');
      if (isDraft) {
        setSubmitSuccessMsg(`✓ Đã lưu nháp thành công lúc ${now}. Em có thể tiếp tục chỉnh sửa trước hạn nộp.`);
      } else {
        setSubmitSuccessMsg(
          `✓ Nộp bài thành công! Thời gian: ${now}. Trạng thái: "Đã nộp" (Phiên bản ${result.submission.currentVersion}).`
        );
      }

      setIsSaving(false);
    } catch (err: any) {
      setIsSaving(false);
      setErrorMessage(err.message || 'Nộp bài thất bại. Vui lòng kiểm tra lại kết nối.');
    }
  };

  // Handle Save Supabase Config
  const handleSaveSupabaseConfig = () => {
    setCustomSupabaseConfig(supabaseUrlInput.trim(), supabaseKeyInput.trim());
    setIsSupabaseConnected(isSupabaseConfigured());
    setSupabaseTestFeedback({
      success: true,
      message: '✓ Đã lưu cấu hình Supabase vào bộ nhớ ứng dụng thành công!',
    });
    setTimeout(() => {
      setShowSupabaseModal(false);
      setSupabaseTestFeedback(null);
    }, 1500);
  };

  // Test live connection to Supabase
  const handleTestSupabaseConfig = async () => {
    // Temporarily save inputs to test them
    setCustomSupabaseConfig(supabaseUrlInput.trim(), supabaseKeyInput.trim());
    setIsTestingSupabase(true);
    setSupabaseTestFeedback(null);
    try {
      const result = await testSupabaseConnection();
      setIsSupabaseConnected(result.success);
      setSupabaseTestFeedback({
        success: result.success,
        message: result.message,
      });
    } catch (err: any) {
      setSupabaseTestFeedback({
        success: false,
        message: `Lỗi kết nối: ${err.message || 'Không thể kiểm tra'}`,
      });
    } finally {
      setIsTestingSupabase(false);
    }
  };

  // File Icon helper
  const getFileIcon = (fileType: string) => {
    const t = fileType.toLowerCase();
    if (['html', 'css', 'js', 'py'].includes(t)) {
      return <FileCode className="w-5 h-5 text-amber-500" />;
    }
    if (['jpg', 'png', 'jpeg', 'webp'].includes(t)) {
      return <Image className="w-5 h-5 text-emerald-500" />;
    }
    if (['zip', 'rar', '7z'].includes(t)) {
      return <Archive className="w-5 h-5 text-purple-500" />;
    }
    if (['docx', 'doc', 'pdf'].includes(t)) {
      return <FileText className="w-5 h-5 text-blue-500" />;
    }
    return <FileText className="w-5 h-5 text-slate-500" />;
  };

  // Trigger AI 4C diagnosis with uploaded files
  const handleTriggerAI4C = () => {
    // If there is an HTML file in uploaded files, extract or read it
    const htmlFile = fileList.find(
      (f) => f.fileType === 'html' || f.fileName.endsWith('.html') || f.fileName.endsWith('.htm')
    );

    if (onAnalyzeWith4C) {
      onAnalyzeWith4C(htmlFile ? undefined : undefined);
    } else {
      setActiveView('reviewer_4c');
    }
  };

  return (
    <div className="space-y-6">
      {/* Assignment Selection & Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-[#1E3A8A] text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase">
                {currentAssignment.subject} • {currentAssignment.className}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Giáo viên: <strong>{currentAssignment.teacherName}</strong>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {currentAssignment.title}
            </h1>
          </div>

          {/* Assignment Dropdown Switcher */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 hidden sm:inline">Đổi bài tập:</label>
            <select
              value={currentAssignment.id}
              onChange={(e) => onSelectAssignment?.(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:bg-white focus:outline-blue-500 cursor-pointer"
            >
              {assignments.map((asg) => (
                <option key={asg.id} value={asg.id}>
                  {asg.title} ({asg.className})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Requirements and Specs Bar */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5 text-xs">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Yêu cầu bài tập của giáo viên:</span>
          </div>
          <p className="text-slate-600 leading-relaxed">{currentAssignment.description}</p>
          <ul className="list-disc pl-5 text-slate-600 space-y-1">
            {currentAssignment.requirements.map((req, i) => (
              <li key={i}>{req}</li>
            ))}
          </ul>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3 text-[11px] text-slate-500 font-medium">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1 text-rose-600 font-bold">
                <Calendar className="w-3.5 h-3.5" />
                Hạn nộp: {currentAssignment.dueDate}
              </span>
              <span>Dung lượng tối đa: <strong>{maxMb} MB/tệp</strong></span>
              <span>
                Định dạng cho phép:{' '}
                <strong className="text-slate-700">{allowedExtensions.join(', ')}</strong>
              </span>
            </div>

            {/* Supabase Storage Indicator */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowSupabaseModal(true)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold cursor-pointer transition-all ${
                  isSupabaseConnected
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                }`}
              >
                <Database className="w-3 h-3" />
                <span>
                  {isSupabaseConnected ? 'Supabase Storage: Đã kết nối' : 'Lưu trữ Server: Sẵn sàng'}
                </span>
                <span className="text-[9px] underline ml-1">Cấu hình</span>
              </button>
            </div>
          </div>
        </div>

        {/* Current Submission Status Badge */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Trạng thái bài làm của em:</span>
            {existingSubmission?.status === 'submitted' ? (
              <span className="bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1 rounded-full flex items-center gap-1 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" /> Đã nộp thành công (Phiên bản {existingSubmission.currentVersion})
              </span>
            ) : existingSubmission?.status === 'draft' ? (
              <span className="bg-amber-100 text-amber-800 font-extrabold px-3 py-1 rounded-full flex items-center gap-1 text-xs">
                <Clock className="w-3.5 h-3.5" /> Bản lưu nháp
              </span>
            ) : (
              <span className="bg-slate-100 text-slate-600 font-extrabold px-3 py-1 rounded-full text-xs">
                Chưa nộp bài
              </span>
            )}

            {existingSubmission?.submittedAt && (
              <span className="text-[11px] text-slate-500">
                (Lúc: {existingSubmission.submittedAt})
              </span>
            )}
          </div>

          {/* Teacher Grade if reviewed */}
          {existingSubmission?.teacherGrade !== undefined && (
            <div className="bg-purple-50 text-purple-900 border border-purple-200 px-3 py-1 rounded-xl font-bold flex items-center gap-2">
              <span>Điểm giáo viên:</span>
              <span className="text-sm font-black text-purple-700">
                {existingSubmission.teacherGrade}/10
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Upload Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-[#2563EB]" />
            <span>Khu vực tải tệp & sản phẩm học tập</span>
          </h2>
          <span className="text-xs text-slate-500">Hỗ trợ tải nhiều file cùng lúc</span>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files) {
              handleFilesChosen(e.dataTransfer.files);
            }
          }}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all ${
            isDragOver
              ? 'border-[#2563EB] bg-blue-50/60 scale-[1.01]'
              : 'border-slate-300 hover:border-[#2563EB]/70 bg-slate-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.jpg,.jpeg,.png,.html,.htm,.css,.js,.py,.zip,.rar"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                handleFilesChosen(e.target.files);
              }
            }}
          />

          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-[#2563EB] flex items-center justify-center mx-auto shadow-sm">
              <Upload className="w-8 h-8" />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">
                Kéo và thả tệp sản phẩm học tập vào đây
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Hoặc nhấp vào nút bên dưới để duyệt tệp từ máy tính / điện thoại của em
              </p>
            </div>

            {/* Large Blue Button: CHỌN TỆP TỪ THIẾT BỊ */}
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-8 py-3.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 mx-auto cursor-pointer"
              >
                <FolderOpen className="w-5 h-5" />
                <span>CHỌN TỆP TỪ THIẾT BỊ</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-400">
              Định dạng hỗ trợ: PDF, Word, PowerPoint, Excel, Ảnh (JPG, PNG), HTML, CSS, JS, Python, ZIP (Tối đa 20MB/file)
            </div>
          </div>
        </div>

        {/* Uploading Progress Items */}
        {uploadingFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700">Đang tải tệp lên hệ thống...</h4>
            {uploadingFiles.map((up, i) => (
              <div key={i} className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-medium text-slate-800">
                  <span className="truncate max-w-[70%]">{up.name}</span>
                  <span className="text-blue-600 font-bold">{up.progress}%</span>
                </div>
                <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#2563EB] h-full transition-all duration-200"
                    style={{ width: `${up.progress}%` }}
                  ></div>
                </div>
                {up.error && <p className="text-[11px] text-rose-600 font-bold">{up.error}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Uploaded File List */}
        {fileList.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Danh sách tệp đính kèm ({fileList.length} tệp)
              </h3>
              <span className="text-[11px] text-slate-500">
                Tổng:{' '}
                {formatFileSize(fileList.reduce((acc, curr) => acc + curr.fileSize, 0))}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fileList.map((file) => (
                <div
                  key={file.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-blue-300 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 rounded-lg bg-slate-100 shrink-0">
                      {getFileIcon(file.fileType)}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-slate-800 truncate" title={file.fileName}>
                        {file.fileName}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {formatFileSize(file.fileSize)} • {file.uploadedAt || 'Vừa tải lên'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {file.storageUrl && (
                      <a
                        href={file.storageUrl}
                        download={file.fileName}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Tải về tệp"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Xóa tệp"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* External Links Section */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Link className="w-4 h-4 text-blue-600" />
              <span>Đính kèm liên kết ngoài (Google Drive, Canva, Video)</span>
            </h3>

            {!showAddLink && (
              <button
                type="button"
                onClick={() => setShowAddLink(true)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm liên kết</span>
              </button>
            )}
          </div>

          {/* Add Link Form */}
          {showAddLink && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-in fade-in text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Loại liên kết</label>
                  <select
                    value={newLinkType}
                    onChange={(e) => setNewLinkType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="google_drive">Google Drive (Thư mục / Tài liệu)</option>
                    <option value="canva">Thiết kế Canva</option>
                    <option value="video">Video (YouTube / Loom / Drive)</option>
                    <option value="other">Trang web khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tiêu đề liên kết</label>
                  <input
                    type="text"
                    placeholder="VD: Bản thiết kế Slide Canva nhóm 1"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Đường dẫn URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddLink(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-xl font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleAddExternalLink}
                  className="px-4 py-1.5 text-xs bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Xác nhận thêm
                </button>
              </div>
            </div>
          )}

          {/* External Links List */}
          {externalLinks.length > 0 && (
            <div className="space-y-2">
              {externalLinks.map((link) => (
                <div
                  key={link.id}
                  className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-extrabold text-[10px] uppercase shrink-0">
                      {link.type.replace('_', ' ')}
                    </span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-slate-800 hover:text-blue-600 truncate flex items-center gap-1"
                    >
                      <span>{link.title}</span>
                      <ExternalLinkIcon className="w-3 h-3 text-slate-400" />
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveLink(link.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Student Notes */}
        <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
          <label className="font-bold text-slate-700 block">
            Ghi chú gửi giáo viên (Tùy chọn):
          </label>
          <textarea
            rows={3}
            placeholder="Ghi chú thêm về sản phẩm, quá trình thực hiện hoặc câu hỏi cho cô giáo..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-blue-500 font-sans"
          />
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {submitSuccessMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{submitSuccessMsg}</span>
          </div>
        )}

        {/* Action Buttons: LƯU NHÁP & NỘP BÀI */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handlePerformSubmit(true)}
              className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4 text-slate-500" />
              <span>LƯU NHÁP</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Bridge to AI 4C button */}
            <button
              type="button"
              onClick={handleTriggerAI4C}
              className="px-5 py-2.5 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>PHÂN TÍCH BÀI BẰNG AI 4C</span>
            </button>

            {/* Main Submit Button */}
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handlePerformSubmit(false)}
              className="px-8 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>
                {existingSubmission?.status === 'submitted'
                  ? 'NỘP LẠI (PHIÊN BẢN MỚI)'
                  : 'NỘP BÀI CHÍNH THỨC'}
              </span>
            </button>
          </div>
        </div>

        {/* Submission Version History */}
        {existingSubmission && existingSubmission.versions.length > 0 && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Lịch sử các phiên bản đã nộp ({existingSubmission.versions.length} phiên bản)</span>
            </h4>

            <div className="space-y-2">
              {existingSubmission.versions.map((ver) => (
                <div
                  key={ver.versionNumber}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between flex-wrap gap-2"
                >
                  <div>
                    <div className="font-bold text-slate-800 flex items-center gap-2">
                      <span className="bg-blue-100 text-[#2563EB] px-2 py-0.5 rounded text-[10px]">
                        Version {ver.versionNumber}
                      </span>
                      <span>{ver.notes || 'Phiên bản nộp bài'}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Thời gian: {ver.submittedAt} •{' '}
                      {ver.attachedFiles?.length || 0} tệp đính kèm
                    </div>
                  </div>

                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Đã lưu trữ
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Supabase Configuration Modal */}
      {showSupabaseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Cấu hình Supabase Database & Storage
                </h3>
              </div>
              <button
                onClick={() => setShowSupabaseModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Hệ thống đã chuẩn bị sẵn cơ chế lưu trữ kép: Mặc định lưu trữ file thật tại ổ cứng máy chủ
              (<code>/uploads</code>) và sẵn sàng kết nối trực tiếp với <strong>Supabase Storage Bucket</strong> (riêng tư, signed URL) theo yêu cầu cuộc thi.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Supabase Project URL</label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseUrlInput}
                  onChange={(e) => setSupabaseUrlInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Supabase Anon Key</label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKeyInput}
                  onChange={(e) => setSupabaseKeyInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white"
                />
              </div>

              {supabaseTestFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                    supabaseTestFeedback.success
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border border-amber-200 text-amber-800'
                  }`}
                >
                  {supabaseTestFeedback.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <span>{supabaseTestFeedback.message}</span>
                </div>
              )}

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900">
                <strong>Ghi chú:</strong> Tệp khởi tạo bảng SQL, cấu hình RLS và Bucket đã được xuất tại{' '}
                <code>/supabase/schema.sql</code>. Em hoặc thầy cô có thể copy và chạy trong Supabase SQL Editor.
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleTestSupabaseConfig}
                disabled={isTestingSupabase}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTestingSupabase ? 'animate-spin' : ''}`} />
                {isTestingSupabase ? 'Đang kiểm tra kết nối...' : 'Kiểm tra kết nối'}
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowSupabaseModal(false);
                    setSupabaseTestFeedback(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleSaveSupabaseConfig}
                  className="px-5 py-2 text-xs font-bold bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl cursor-pointer shadow-xs"
                >
                  Lưu cấu hình
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
