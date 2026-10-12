import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Code,
  Eye,
  ArrowRight,
  RefreshCw,
  Send,
  History,
  FileCheck,
  ChevronDown,
  Award,
  Layers,
  Info,
  ShieldAlert,
  RotateCcw,
  Check,
  ThumbsUp,
  Upload,
  FileCode,
  Save,
  Sliders,
  CheckCircle2,
  Clock,
  BookOpen,
  Split,
  Maximize2,
  FileText,
  UserCheck,
  Search,
  Compass,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  DEMO_FLAWED_HTML,
  DEMO_CORRECTED_HTML,
} from '../data/mockData';
import { aiService } from '../services/aiService';
import { AIFeedback4C, DiagnosticIssue } from '../types';
import { StudentUploadArea } from './StudentUploadArea';
import { TeacherSubmissionManager } from './TeacherSubmissionManager';

export const AssignmentReviewer4C: React.FC = () => {
  const {
    currentUser,
    assignments,
    submissions,
    submitNewVersion,
    teacherConfirmGrade,
    serverHealth,
    logAction,
  } = useApp();

  // Find demo assignment (Bài 9)
  const assignment = assignments.find((a) => a.id === 'asg_bai9_html') || assignments[0];

  // Find submission for current student or fallback to first submission
  const currentSubmission = submissions.find(
    (s) => s.assignmentId === assignment.id && (s.studentId === currentUser.id || currentUser.role !== 'STUDENT')
  ) || submissions[0];

  // Active step in 4C model: 'c1' | 'c2' | 'c3' | 'c4'
  const [activeStep, setActiveStep] = useState<'c1' | 'c2' | 'c3' | 'c4'>('c1');

  // Step completion status
  const [stepsCompleted, setStepsCompleted] = useState<{
    c1: boolean;
    c2: boolean;
    c3: boolean;
    c4: boolean;
  }>({
    c1: Boolean(currentSubmission?.versions[0]?.aiFeedback),
    c2: Boolean(currentSubmission?.versions[0]?.aiFeedback?.issues.length),
    c3: (currentSubmission?.versions.length || 0) > 1,
    c4: Boolean(currentSubmission?.isConfirmedByTeacher),
  });

  // Demo mode toggle: Isolated for Judges / Teachers
  const [demoModeEnabled, setDemoModeEnabled] = useState<boolean>(false);

  // Primary Mode in Nộp bài & AI 4C
  const [primaryMode, setPrimaryMode] = useState<'upload' | 'ai_4c' | 'teacher_manager'>('upload');
  const [selectedAsgId, setSelectedAsgId] = useState<string>(assignment.id);

  // Selected version to view (1 or 2)
  const [viewVersionNum, setViewVersionNum] = useState<number>(
    currentSubmission?.versions?.length || 1
  );

  // Editor code buffer
  const [codeBuffer, setCodeBuffer] = useState<string>(
    currentSubmission?.versions[currentSubmission.versions.length - 1]?.htmlContent || DEMO_FLAWED_HTML
  );

  // Feedback state for current inspection
  const [currentFeedback, setCurrentFeedback] = useState<AIFeedback4C | null>(
    currentSubmission?.versions[currentSubmission.versions.length - 1]?.aiFeedback || null
  );

  // Loading state during AI diagnostic
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticNotice, setDiagnosticNotice] = useState<string | null>(null);

  // Unlocked hint levels per issue index: { [issueIndex]: level (1, 2, or 3) }
  const [unlockedHints, setUnlockedHints] = useState<Record<number, number>>({
    0: 1, // First issue starts at Level 1
    1: 1,
  });

  // Editor View Mode: 'split' | 'code' | 'preview'
  const [editorMode, setEditorMode] = useState<'split' | 'code' | 'preview'>('split');

  // Teacher confirmation modal states
  const [teacherGradeInput, setTeacherGradeInput] = useState<number>(9.5);
  const [teacherCommentInput, setTeacherCommentInput] = useState<string>(
    'Cô đánh giá rất cao tinh thần tự học của em. Em đã xem gợi ý 4C để tự sửa thẻ bảng và danh sách chuẩn chỉ.'
  );
  const [confirmSuccess, setConfirmSuccess] = useState(false);
  const [saveDraftNotice, setSaveDraftNotice] = useState(false);

  // File upload input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Comparison Versions for C4
  const [c4CompareLeftVer, setC4CompareLeftVer] = useState<number>(1);
  const [c4CompareRightVer, setC4CompareRightVer] = useState<number>(
    currentSubmission?.versions?.length > 1 ? currentSubmission.versions.length : 1
  );

  // Sync buffer when version selector changes
  useEffect(() => {
    const selectedVer = currentSubmission?.versions.find((v) => v.versionNumber === viewVersionNum);
    if (selectedVer) {
      setCodeBuffer(selectedVer.htmlContent);
      if (selectedVer.aiFeedback) {
        setCurrentFeedback(selectedVer.aiFeedback);
      }
    }
  }, [viewVersionNum, currentSubmission]);

  // Execute C1 Diagnostic
  const handleRunDiagnostic = async (overrideCode?: string) => {
    const codeToTest = overrideCode || codeBuffer;
    setIsDiagnosing(true);
    setDiagnosticNotice(null);

    logAction('AI_DIAGNOSTIC_TRIGGERED', assignment.title, `Phân tích mã nguồn ${codeToTest.length} ký tự`);

    const result = await aiService.diagnoseSubmission({
      htmlCode: codeToTest,
      assignmentTitle: assignment.title,
      rubricItems: assignment.rubric,
      versionNumber: viewVersionNum,
    });

    setIsDiagnosing(false);

    if (result && result.analysis) {
      const feedbackData: AIFeedback4C = {
        timestamp: new Date().toLocaleString('vi-VN'),
        summary: result.analysis.summary,
        scoreEstimate: result.analysis.scoreEstimate,
        passedCriteria: result.analysis.passedCriteria || [],
        improvedCriteria: result.analysis.improvedCriteria || [],
        issues: result.analysis.issues || [],
        rubricResults: result.analysis.rubricResults || [],
        pedagogicalPraise: result.analysis.pedagogicalPraise || 'Học sinh có ý thức tự học tốt!',
        hintsUsedCount: 0,
        unlockedHintLevels: { 0: 1, 1: 1 },
      };

      setCurrentFeedback(feedbackData);
      setDiagnosticNotice(
        result.source === 'gemini-3.8-flash'
          ? '✓ Đã hoàn tất chẩn đoán bằng Google Gemini 3.8 Flash'
          : '✓ Đã chẩn đoán bằng Bộ quy chuẩn Sư phạm Tin học THPT'
      );

      setStepsCompleted((prev) => ({ ...prev, c1: true }));
      setActiveStep('c1');
    }
  };

  // 1-Click Load Flawed Demo (Inside Demo Mode only)
  const handleLoadFlawedDemo = () => {
    setCodeBuffer(DEMO_FLAWED_HTML);
    handleRunDiagnostic(DEMO_FLAWED_HTML);
  };

  // 1-Click Load Corrected Demo (Inside Demo Mode only)
  const handleLoadCorrectedDemo = () => {
    setCodeBuffer(DEMO_CORRECTED_HTML);
    handleRunDiagnostic(DEMO_CORRECTED_HTML);
  };

  // Local file upload (.html)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      alert('Vui lòng chọn tệp định dạng .html hoặc .htm');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCodeBuffer(content);
        handleRunDiagnostic(content);
        logAction('FILE_UPLOAD', assignment.title, `Tải lên tệp ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  // Unlock next hint level in C2
  const handleUnlockHint = (issueIndex: number, currentLevel: number) => {
    if (currentLevel < 3) {
      setUnlockedHints((prev) => ({
        ...prev,
        [issueIndex]: currentLevel + 1,
      }));
      setStepsCompleted((prev) => ({ ...prev, c2: true }));
      logAction('UNLOCK_HINT', `Lỗi ${issueIndex + 1}`, `Mở gợi ý Mức ${currentLevel + 1}`);
    }
  };

  // Save Draft
  const handleSaveDraft = () => {
    setSaveDraftNotice(true);
    setTimeout(() => setSaveDraftNotice(false), 2500);
  };

  // Submit code as new version (C3 -> C4)
  const handleSubmitRevision = () => {
    const res = submitNewVersion(
      assignment.id,
      codeBuffer,
      `Bản chỉnh sửa theo gợi ý AI 4C (Lần nộp mới)`,
      currentFeedback || undefined
    );
    setViewVersionNum(res.versionNumber);
    setC4CompareRightVer(res.versionNumber);
    setStepsCompleted((prev) => ({ ...prev, c3: true }));
    setActiveStep('c4');
    logAction('SUBMIT_REVISION', assignment.title, `Nộp thành công Phiên bản ${res.versionNumber}`);
  };

  // Teacher confirms final score
  const handleTeacherConfirm = () => {
    if (currentSubmission) {
      teacherConfirmGrade(currentSubmission.id, teacherGradeInput, teacherCommentInput);
      setConfirmSuccess(true);
      setStepsCompleted((prev) => ({ ...prev, c4: true }));
      setTimeout(() => setConfirmSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. COMPACT LESSON BANNER (Reduced height by 30%, Clean Dark Blue #1E3A8A) */}
      <div className="bg-[#1E3A8A] text-white rounded-2xl p-5 shadow-lg border border-blue-400/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            {/* Metadata row */}
            <div className="flex items-center gap-2 flex-wrap text-xs text-blue-200">
              <span className="bg-blue-600/90 text-white font-bold px-2 py-0.5 rounded-md text-[11px]">
                {assignment.subject}
              </span>
              <span>•</span>
              <span className="font-medium">Lớp {assignment.className}</span>
              <span>•</span>
              <span>GV phụ trách: <strong className="text-white">Cô Trần Thị Tuyết Nhung</strong></span>
              <span>•</span>
              <span>Hạn nộp: <strong className="text-amber-300">{assignment.dueDate}</strong></span>
            </div>

            {/* Lesson Title */}
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
              {assignment.title}
            </h1>

            {/* Compact Requirements Text */}
            <p className="text-xs sm:text-[13px] text-blue-100/90 line-clamp-2 leading-relaxed">
              <strong>Yêu cầu:</strong> {assignment.description}
            </p>
          </div>

          {/* Right Action & Demo Mode Toggle */}
          <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
            {/* Demo Mode Toggle Switch */}
            <div className="flex items-center gap-2 bg-blue-950/70 border border-blue-400/30 px-3 py-1.5 rounded-xl text-xs">
              <Sliders className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-blue-100 font-semibold text-[11px]">Chế độ Demo:</span>
              <button
                type="button"
                onClick={() => setDemoModeEnabled(!demoModeEnabled)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  demoModeEnabled ? 'bg-amber-400' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                    demoModeEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={() => handleRunDiagnostic()}
              disabled={isDiagnosing}
              className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isDiagnosing ? 'animate-spin' : ''}`} />
              <span>{isDiagnosing ? 'Đang chẩn đoán...' : 'Chạy chẩn đoán AI'}</span>
            </button>
          </div>
        </div>

        {/* ISOLATED DEMO PANEL (Shown only when Demo Mode is ON) */}
        {demoModeEnabled && (
          <div className="mt-4 pt-3.5 border-t border-blue-700/60 bg-blue-950/80 p-3.5 rounded-xl border border-amber-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs text-amber-200">
              <span className="bg-amber-400 text-blue-950 font-black text-[10px] px-2 py-0.5 rounded uppercase">
                Chế độ Trình diễn
              </span>
              <span>Dành cho Giám khảo & Giáo viên kiểm thử chuỗi 4C (Dữ liệu không thay thế bài thật).</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleLoadFlawedDemo}
                className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-blue-950 font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Nạp bài có lỗi cố ý (Demo)</span>
              </button>

              <button
                onClick={handleLoadCorrectedDemo}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Nạp bài đã sửa chuẩn (Tiến bộ)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Primary Sub-Navigation inside Nộp bài & AI 4C */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setPrimaryMode('upload')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              primaryMode === 'upload'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#2563EB] hover:bg-slate-50'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>1. HỌC SINH UPLOAD VÀ NỘP BÀI TẬP</span>
            <span className="bg-amber-400 text-blue-950 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
              Mới
            </span>
          </button>

          <button
            onClick={() => setPrimaryMode('ai_4c')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              primaryMode === 'ai_4c'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#2563EB] hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>2. QUY TRÌNH AI 4C & TỰ HOÀN THIỆN</span>
          </button>

          <button
            onClick={() => setPrimaryMode('teacher_manager')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              primaryMode === 'teacher_manager'
                ? 'bg-[#1E3A8A] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#1E3A8A] hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>3. GIÁO VIÊN CHẤM & QUẢN LÝ BÀI NỘP</span>
          </button>
        </div>
      </div>

      {/* Mode 1: HỌC SINH UPLOAD VÀ NỘP BÀI TẬP */}
      {primaryMode === 'upload' && (
        <StudentUploadArea
          selectedAssignmentId={selectedAsgId || assignment.id}
          onSelectAssignment={(id) => setSelectedAsgId(id)}
          onAnalyzeWith4C={(customHtml) => {
            if (customHtml) setCodeBuffer(customHtml);
            setPrimaryMode('ai_4c');
            handleRunDiagnostic(customHtml);
          }}
        />
      )}

      {/* Mode 3: GIÁO VIÊN CHẤM & QUẢN LÝ BÀI NỘP */}
      {primaryMode === 'teacher_manager' && (
        <TeacherSubmissionManager assignmentId={selectedAsgId || assignment.id} />
      )}

      {/* Mode 2: QUY TRÌNH AI 4C & TỰ HOÀN THIỆN */}
      {primaryMode === 'ai_4c' && (
        <>
          {/* 2. HORIZONTAL AI 4C PROGRESS STEPPER (Centered, Informative, Interactive) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            {
              id: 'c1',
              step: 'C1',
              name: 'CHẨN ĐOÁN',
              desc: 'Phát hiện lỗi & đối chiếu Rubric',
              icon: Search,
              isCompleted: stepsCompleted.c1,
            },
            {
              id: 'c2',
              step: 'C2',
              name: 'CHỈ DẪN',
              desc: '3 Mức gợi ý Socratic (không làm hộ)',
              icon: Compass,
              isCompleted: stepsCompleted.c2,
            },
            {
              id: 'c3',
              step: 'C3',
              name: 'CHỈNH SỬA',
              desc: 'Soạn mã & Xem trước Sandbox',
              icon: Code,
              isCompleted: stepsCompleted.c3,
            },
            {
              id: 'c4',
              step: 'C4',
              name: 'CHỨNG MINH TIẾN BỘ',
              desc: 'So sánh Version & GV duyệt điểm',
              icon: TrendingUp,
              isCompleted: stepsCompleted.c4,
            },
          ].map((item) => {
            const isActive = activeStep === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setActiveStep(item.id as any)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  isActive
                    ? 'bg-blue-50/90 border-[#2563EB] shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                {/* Active indicator bar */}
                {isActive && <div className="absolute top-0 left-0 right-0 h-1 bg-[#2563EB]" />}

                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                        isActive
                          ? 'bg-[#2563EB] text-white'
                          : item.isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.step}
                    </div>
                    <span
                      className={`text-xs font-black tracking-tight ${
                        isActive ? 'text-[#1E3A8A]' : 'text-slate-800'
                      }`}
                    >
                      {item.name}
                    </span>
                  </div>

                  {item.isCompleted ? (
                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                      <Check className="w-3 h-3" /> Đã xong
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">Chờ xử lý</span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 truncate leading-normal">
                  {item.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TWO-COLUMN WORKSPACE: LEFT = STUDENT WORKSPACE, RIGHT = AI MENTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ==================== LEFT COLUMN: BÀI LÀM HỌC SINH (7 COLS) ==================== */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Header toolbar */}
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[#2563EB]" />
                <span className="font-extrabold text-xs text-slate-900">
                  Bài làm học sinh (HTML)
                </span>
                <span className="text-[11px] bg-blue-100 text-[#1E3A8A] font-bold px-2 py-0.5 rounded-md">
                  Version {viewVersionNum}
                </span>
              </div>

              {/* View mode switcher */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setEditorMode('code')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                    editorMode === 'code' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Mã nguồn
                </button>
                <button
                  onClick={() => setEditorMode('split')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                    editorMode === 'split' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Chia đôi
                </button>
                <button
                  onClick={() => setEditorMode('preview')}
                  className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                    editorMode === 'preview' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Xem trước
                </button>
              </div>

              {/* Upload file button */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".html,.htm"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title="Tải tệp HTML từ máy tính của em"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Tải file .html</span>
                </button>
              </div>
            </div>

            {/* Editor & Sandbox Content Area */}
            <div className={`grid ${editorMode === 'split' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} min-h-[460px] bg-slate-900`}>
              {/* Code Editor */}
              {(editorMode === 'split' || editorMode === 'code') && (
                <div className="flex bg-[#0F172A] font-mono text-xs border-r border-slate-800">
                  {/* Line numbers */}
                  <div className="w-10 py-3.5 select-none text-right pr-2 text-slate-600 bg-slate-950/80 border-r border-slate-800/80 leading-6 text-[11px]">
                    {codeBuffer.split('\n').map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>

                  {/* Textarea */}
                  <textarea
                    value={codeBuffer}
                    onChange={(e) => setCodeBuffer(e.target.value)}
                    className="flex-1 p-3.5 bg-transparent text-emerald-300 font-mono text-xs leading-6 resize-none focus:outline-hidden selection:bg-blue-800 selection:text-white"
                    spellCheck={false}
                    placeholder="<!-- Em hãy viết hoặc dán mã HTML tại đây -->"
                  />
                </div>
              )}

              {/* Sandbox Preview */}
              {(editorMode === 'split' || editorMode === 'preview') && (
                <div className="bg-white flex flex-col border-t md:border-t-0 md:border-l border-slate-200">
                  <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600 font-sans">
                    <span className="font-bold flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      Bản xem trước HTML
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">sandbox="allow-scripts"</span>
                  </div>

                  <div className="flex-1 p-3 bg-slate-50 min-h-[400px]">
                    <iframe
                      title="HTML Preview Sandbox"
                      srcDoc={codeBuffer}
                      sandbox="allow-scripts"
                      className="w-full h-full min-h-[400px] bg-white rounded-xl border border-slate-300 shadow-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bottom action toolbar */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveDraft}
                  className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-slate-500" />
                  <span>Lưu bản nháp</span>
                </button>

                {saveDraftNotice && (
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    ✓ Đã lưu nháp an toàn
                  </span>
                )}
              </div>

              {/* Primary Action Button: Nộp bài / Nộp lại (C3) */}
              <button
                onClick={handleSubmitRevision}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Nộp lại bài (Tạo Version {currentSubmission ? currentSubmission.versions.length + 1 : 2})</span>
              </button>
            </div>
          </div>
        </div>

        {/* ==================== RIGHT COLUMN: AI MENTOR (5 COLS) ==================== */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    AI MENTOR – Hướng dẫn 4C
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Phản hồi quá trình theo tiêu chí Rubric
                  </p>
                </div>
              </div>

              {diagnosticNotice && (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {diagnosticNotice}
                </span>
              )}
            </div>

            {currentFeedback ? (
              <div className="space-y-4">
                {/* Score & Praise Summary */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Điểm ước lượng tạm tính
                    </span>
                    <span className="text-xl font-black text-[#2563EB]">
                      {currentFeedback.scoreEstimate.toFixed(1)} <span className="text-xs font-normal text-slate-400">/ 10</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "{currentFeedback.summary}"
                  </p>

                  <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 flex items-start gap-1.5 font-medium">
                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Lời khen sư phạm:</strong> {currentFeedback.pedagogicalPraise}</span>
                  </div>
                </div>

                {/* Rubric Evaluation (5 tiêu chí) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900">Tiêu chí Rubric bài tập</span>
                    <span className="text-slate-400 text-[11px]">5 Tiêu chuẩn</span>
                  </div>

                  <div className="space-y-1.5">
                    {currentFeedback.rubricResults.map((r, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                          r.status === 'passed'
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                            : r.status === 'partial'
                            ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                            : 'bg-red-50/70 border-red-200 text-red-900'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {r.status === 'passed' && <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          {r.status === 'partial' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                          {r.status === 'failed' && <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                          <span className="font-semibold truncate">{r.criteria}</span>
                        </div>

                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded shrink-0 ${
                            r.status === 'passed'
                              ? 'bg-emerald-200 text-emerald-800'
                              : r.status === 'partial'
                              ? 'bg-amber-200 text-amber-800'
                              : 'bg-red-200 text-red-800'
                          }`}
                        >
                          {r.status === 'passed' ? 'Đạt' : r.status === 'partial' ? 'Cần sửa' : 'Chưa đạt'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detected Issues & 3-Tier Guidance */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900">
                      Chỉ dẫn cải thiện ({currentFeedback.issues.length} vấn đề)
                    </span>
                    <span className="text-[10px] text-blue-600 font-semibold">Gợi ý 3 Mức</span>
                  </div>

                  {currentFeedback.issues.length === 0 ? (
                    <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs text-center font-bold">
                      ✓ Mã nguồn hoàn thiện xuất sắc! Không phát hiện lỗi cần sửa.
                    </div>
                  ) : (
                    currentFeedback.issues.map((issue, idx) => {
                      const level = unlockedHints[idx] || 1;
                      return (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-800 text-[11px]">
                              &lt;{issue.element}&gt; (Dòng {issue.line || '—'})
                            </span>
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                              Đang mở Mức {level}/3
                            </span>
                          </div>

                          {/* Level 1 Hint */}
                          <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-slate-800 space-y-0.5">
                            <div className="text-[10px] font-black uppercase text-blue-800 tracking-wider">
                              Mức 1: Nhận diện lỗi
                            </div>
                            <p className="text-[11px] leading-relaxed">{issue.level1Hint}</p>
                          </div>

                          {/* Level 2 Hint */}
                          {level >= 2 && (
                            <div className="p-2.5 rounded-lg bg-cyan-50 border border-cyan-200 text-slate-800 space-y-0.5 animate-in fade-in">
                              <div className="text-[10px] font-black uppercase text-cyan-800 tracking-wider">
                                Mức 2: Gợi ý kiến thức
                              </div>
                              <p className="text-[11px] leading-relaxed">{issue.level2Hint}</p>
                            </div>
                          )}

                          {/* Level 3 Hint */}
                          {level >= 3 && (
                            <div className="p-2.5 rounded-lg bg-purple-50 border border-purple-200 text-slate-800 space-y-0.5 animate-in fade-in">
                              <div className="text-[10px] font-black uppercase text-purple-800 tracking-wider">
                                Mức 3: Hướng dẫn sâu & Câu hỏi tự nghiệm
                              </div>
                              <p className="text-[11px] leading-relaxed">{issue.level3Hint}</p>
                            </div>
                          )}

                          {/* Unlock next level button */}
                          {level < 3 && (
                            <div className="pt-1 flex justify-end">
                              <button
                                onClick={() => handleUnlockHint(idx, level)}
                                className="px-3 py-1 bg-white hover:bg-blue-50 text-[#2563EB] text-[11px] font-bold border border-blue-300 rounded-lg transition-colors cursor-pointer"
                              >
                                Mở gợi ý Mức {level + 1} →
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                Nhấn <strong>"Chạy chẩn đoán AI"</strong> để xem phân tích chi tiết.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. STUDENT PROGRESS PROOF SECTION (LỊCH SỬ TIẾN BỘ HỌC SINH - C4) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase">
                C4 • Chứng minh tiến bộ
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Lịch sử Tiến bộ Học sinh & Phê duyệt của Giáo viên
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Đối chiếu sai khác giữa các phiên bản mã nguồn đã nộp. Giáo viên là người xác nhận điểm chính thức.
            </p>
          </div>

          {/* Comparison version picker */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Đối chiếu:</span>
            <select
              value={c4CompareLeftVer}
              onChange={(e) => setC4CompareLeftVer(parseInt(e.target.value))}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 font-bold text-slate-800"
            >
              {currentSubmission?.versions.map((v) => (
                <option key={v.versionNumber} value={v.versionNumber}>
                  Lần nộp {v.versionNumber}
                </option>
              ))}
            </select>
            <span className="text-slate-400 font-bold">với</span>
            <select
              value={c4CompareRightVer}
              onChange={(e) => setC4CompareRightVer(parseInt(e.target.value))}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 font-bold text-[#2563EB]"
            >
              {currentSubmission?.versions.map((v) => (
                <option key={v.versionNumber} value={v.versionNumber}>
                  Lần nộp {v.versionNumber} (Mới hơn)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4 KPI Progress Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] font-bold text-slate-500 uppercase">Tổng số lần nộp</div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {currentSubmission?.versions.length || 1} phiên bản
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Lưu trữ từng bước</div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <div className="text-[11px] font-bold text-emerald-800 uppercase">Lỗi đã khắc phục</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {currentSubmission?.versions.reduce((acc, v) => acc + (v.resolvedIssuesCount || 0), 0) || 2} lỗi
            </div>
            <div className="text-[10px] text-emerald-700 mt-0.5">Tự sửa theo chỉ dẫn</div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200">
            <div className="text-[11px] font-bold text-blue-800 uppercase">Điểm số ước lượng phát triển</div>
            <div className="text-2xl font-black text-[#2563EB] mt-1">
              6.0 → 9.5
            </div>
            <div className="text-[10px] text-blue-700 mt-0.5">+3.5 điểm sau 2 lần nộp</div>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200">
            <div className="text-[11px] font-bold text-purple-800 uppercase">Xác nhận của Giáo viên</div>
            <div className="text-2xl font-black text-purple-700 mt-1">
              {currentSubmission?.teacherGrade ? `${currentSubmission.teacherGrade}/10` : '9.5/10'}
            </div>
            <div className="text-[10px] text-purple-700 mt-0.5">
              {currentSubmission?.isConfirmedByTeacher ? 'Cô đã phê duyệt' : 'Chờ duyệt'}
            </div>
          </div>
        </div>

        {/* Side by side code comparison diff */}
        <div className="rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="text-slate-600">Lần nộp {c4CompareLeftVer} (Bản trước)</span>
            <span className="text-emerald-700">Lần nộp {c4CompareRightVer} (Bản đã sửa cải thiện)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {/* Left version code */}
            <div className="p-3 bg-[#0F172A] font-mono text-[11px] overflow-x-auto max-h-[360px]">
              <pre className="text-slate-400 leading-5">
                {currentSubmission?.versions.find((v) => v.versionNumber === c4CompareLeftVer)?.htmlContent || DEMO_FLAWED_HTML}
              </pre>
            </div>

            {/* Right version code */}
            <div className="p-3 bg-[#0F172A] font-mono text-[11px] overflow-x-auto max-h-[360px]">
              <pre className="text-emerald-300 leading-5">
                {currentSubmission?.versions.find((v) => v.versionNumber === c4CompareRightVer)?.htmlContent || DEMO_CORRECTED_HTML}
              </pre>
            </div>
          </div>
        </div>

        {/* Teacher Confirmation & Pedagogical Feedback Area */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-purple-700" />
              <h4 className="font-extrabold text-sm text-slate-900">
                Xác nhận kết quả từ Giáo viên: Cô Trần Thị Tuyết Nhung
              </h4>
            </div>

            {currentSubmission?.isConfirmedByTeacher && (
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Đã xác nhận lúc: {currentSubmission.teacherReviewedAt}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-3 space-y-1">
              <label className="text-xs font-bold text-slate-700">Điểm số chính thức (thang 10):</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={teacherGradeInput}
                onChange={(e) => setTeacherGradeInput(parseFloat(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-purple-900 focus:outline-[#2563EB]"
              />
            </div>

            <div className="md:col-span-7 space-y-1">
              <label className="text-xs font-bold text-slate-700">Lời nhận xét sư phạm của cô:</label>
              <input
                type="text"
                value={teacherCommentInput}
                onChange={(e) => setTeacherCommentInput(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-[#2563EB]"
                placeholder="Ghi nhận nỗ lực tự sửa lỗi của học sinh..."
              />
            </div>

            <div className="md:col-span-2">
              <button
                onClick={handleTeacherConfirm}
                className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>Xác nhận điểm</span>
              </button>
            </div>
          </div>

          {confirmSuccess && (
            <div className="p-3 bg-emerald-100 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Đã lưu xác nhận điểm và cập nhật minh chứng tiến bộ học tập thành công!</span>
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
};
