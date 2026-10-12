import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Sparkles,
  Bot,
  Send,
  Eye,
  CheckCircle2,
  XCircle,
  Award,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Download,
  Users,
  Compass,
  Lock,
  Clock,
  HelpCircle,
  Layers,
  ChevronRight,
  TrendingUp,
  Activity,
  FileText,
  UserCheck,
  Share2,
  ExternalLink,
} from 'lucide-react';
import {
  SafeNetScenario,
  SafeNetCategory,
  SafeNetStudentAttempt,
  SafeNetChoice,
  SafeNetRedFlag,
} from '../../types';
import { aiService } from '../../services/aiService';

export const SafeNetHub: React.FC = () => {
  const {
    currentUser,
    users,
    classes,
    safeNetScenarios,
    safeNetAttempts,
    safeNetChallenges,
    selectedSafeNetScenarioId,
    setSelectedSafeNetScenarioId,
    addSafeNetAttempt,
    createSafeNetScenario,
    createSafeNetChallenge,
    exportSafeNetCSV,
    serverHealth,
    logAction,
  } = useApp();

  // Navigation tab inside SafeNet
  const [activeTab, setActiveTab] = useState<'simulator' | 'analyzer' | 'competency' | 'teacher'>('simulator');

  // Category filter for scenarios
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active scenario playing state
  const activeScenario =
    safeNetScenarios.find((s) => s.id === selectedSafeNetScenarioId) || safeNetScenarios[0];

  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [discoveredRedFlagIds, setDiscoveredRedFlagIds] = useState<string[]>([]);
  const [activeRedFlagInfo, setActiveRedFlagInfo] = useState<SafeNetRedFlag | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<SafeNetChoice | null>(null);
  const [decisionHistory, setDecisionHistory] = useState<
    Array<{ stageId: number; choiceId: string; choiceText: string; isSafe: boolean; score: number }>
  >([]);
  const [isScenarioFinished, setIsScenarioFinished] = useState<boolean>(false);
  const [evaluatingResult, setEvaluatingResult] = useState<boolean>(false);
  const [evaluationData, setEvaluationData] = useState<any | null>(null);

  // Chat simulator state
  const [chatRole, setChatRole] = useState<'scammer' | 'mentor'>('scammer');
  const [chatMessages, setChatMessages] = useState<
    Array<{ id: string; role: 'user' | 'model'; sender: string; text: string; time: string }>
  >([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isAiReplying, setIsAiReplying] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Threat Analyzer state
  const [analyzerInput, setAnalyzerInput] = useState<string>('');
  const [analyzerContentType, setAnalyzerContentType] = useState<string>('Tin nhắn / Đường link nghi vấn');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analyzerResult, setAnalyzerResult] = useState<any | null>(null);

  // Teacher generator state
  const [genTopic, setGenTopic] = useState<string>('Lừa đảo học phí THPT qua mã QR tài khoản lạ');
  const [genCategory, setGenCategory] = useState<SafeNetCategory>('phishing');
  const [genGrade, setGenGrade] = useState<string>('Khối 12');
  const [isGeneratingScenario, setIsGeneratingScenario] = useState<boolean>(false);
  const [newChallengeTitle, setNewChallengeTitle] = useState<string>('Thử thách nhận diện bẫy kỹ thuật số tuần 3');
  const [newChallengeClassId, setNewChallengeClassId] = useState<string>('class_12a1');
  const [newChallengeDueDate, setNewChallengeDueDate] = useState<string>('2025-05-30');

  // Filtered scenarios
  const filteredScenarios = safeNetScenarios.filter((scen) => {
    const matchCat = selectedCategory === 'all' || scen.category === selectedCategory;
    const matchSearch =
      scen.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scen.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Reset simulation when changing scenario
  useEffect(() => {
    setCurrentStageIndex(0);
    setDiscoveredRedFlagIds([]);
    setActiveRedFlagInfo(null);
    setSelectedChoice(null);
    setDecisionHistory([]);
    setIsScenarioFinished(false);
    setEvaluationData(null);
    setChatMessages([
      {
        id: 'msg_welcome',
        role: 'model',
        sender: activeScenario.senderInfo.name,
        text: activeScenario.stages[0]?.promptText || activeScenario.context,
        time: 'Vừa xong',
      },
    ]);
  }, [selectedSafeNetScenarioId]);

  // Scroll chat bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiReplying]);

  // Handler for revealing a red flag
  const handleRevealRedFlag = (rf: SafeNetRedFlag) => {
    if (!discoveredRedFlagIds.includes(rf.id)) {
      setDiscoveredRedFlagIds((prev) => [...prev, rf.id]);
    }
    setActiveRedFlagInfo(rf);
  };

  // Handler for choosing action
  const handleSelectChoice = (choice: SafeNetChoice) => {
    setSelectedChoice(choice);
  };

  // Handler for proceeding to next stage or finish
  const handleProceedStage = async () => {
    if (!selectedChoice) return;

    const currentStage = activeScenario.stages[currentStageIndex];
    const newHistory = [
      ...decisionHistory,
      {
        stageId: currentStage.stageId,
        choiceId: selectedChoice.id,
        choiceText: selectedChoice.text,
        isSafe: selectedChoice.isSafeAction,
        score: selectedChoice.score,
      },
    ];
    setDecisionHistory(newHistory);

    if (currentStageIndex + 1 < activeScenario.stages.length) {
      setCurrentStageIndex((prev) => prev + 1);
      setSelectedChoice(null);
      setActiveRedFlagInfo(null);
      // Append new stage prompt into chat
      const nextStage = activeScenario.stages[currentStageIndex + 1];
      setChatMessages((prev) => [
        ...prev,
        {
          id: `stage_${nextStage.stageId}`,
          role: 'model',
          sender: activeScenario.senderInfo.name,
          text: nextStage.promptText,
          time: 'Vừa xong',
        },
      ]);
    } else {
      // Finished scenario!
      setIsScenarioFinished(true);
      setEvaluatingResult(true);

      const totalScore = Math.round(
        newHistory.reduce((acc, curr) => acc + curr.score, 0) / newHistory.length
      );

      // Call AI to evaluate performance
      const evalRes = await aiService.safenetEvaluateStudent({
        studentName: currentUser.name,
        scenarioTitle: activeScenario.title,
        decisionPath: newHistory,
        identifiedRedFlags: discoveredRedFlagIds,
        totalScore,
      });

      const evalData = evalRes?.data || {
        aiEvaluationSummary: `Em ${currentUser.name} đã hoàn thành tình huống an toàn số với kết quả ${totalScore}/100.`,
        aiStrengths: ['Nhận diện tốt các rủi ro mạng', 'Tư duy cảnh giác trước bẫy lừa'],
        aiAreasToImprove: ['Thực hành kiểm chứng bằng phương pháp SIFT thường xuyên hơn.'],
        competencies: {
          threatIdentification: Math.min(100, totalScore + 2),
          safeResponse: totalScore,
          dataProtection: Math.min(100, totalScore + 5),
          criticalThinking: totalScore,
          digitalCulture: 95,
        },
        earnedBadge: totalScore >= 90 ? 'Lá chắn Vàng An toàn số' : 'Hiệp sĩ Số Tiềm năng',
      };

      setEvaluationData(evalData);
      setEvaluatingResult(false);

      // Save attempt to global state
      addSafeNetAttempt({
        scenarioId: activeScenario.id,
        scenarioTitle: activeScenario.title,
        category: activeScenario.category,
        studentId: currentUser.id,
        studentName: currentUser.name,
        className: currentUser.className || '12A1',
        totalScore,
        decisionPath: newHistory,
        identifiedRedFlagIds: discoveredRedFlagIds,
        aiEvaluationSummary: evalData.aiEvaluationSummary,
        aiStrengths: evalData.aiStrengths,
        aiAreasToImprove: evalData.aiAreasToImprove,
        competencies: evalData.competencies,
        earnedBadge: evalData.earnedBadge,
      });
    }
  };

  // Chat message send
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isAiReplying) return;

    const userText = chatInput.trim();
    setChatInput('');

    const newMsgs = [
      ...chatMessages,
      {
        id: `usr_${Date.now()}`,
        role: 'user' as const,
        sender: currentUser.name,
        text: userText,
        time: 'Vừa xong',
      },
    ];
    setChatMessages(newMsgs);
    setIsAiReplying(true);

    try {
      const res = await aiService.safenetSimulateChat({
        scenarioId: activeScenario.id,
        scenarioTitle: activeScenario.title,
        targetRole: chatRole,
        studentMessage: userText,
        history: newMsgs.map((m) => ({ role: m.role, text: m.text })),
        context: activeScenario.context,
      });

      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          role: 'model',
          sender: chatRole === 'scammer' ? activeScenario.senderInfo.name : 'Cyber Mentor (Thầy/Cô An Toàn Số)',
          text: res.reply || 'Hệ thống đã ghi nhận phản hồi của em.',
          time: 'Vừa xong',
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiReplying(false);
    }
  };

  // Run threat analyzer
  const handleRunThreatAnalyzer = async (customText?: string) => {
    const textToAnalyze = customText || analyzerInput;
    if (!textToAnalyze.trim()) return;

    setIsAnalyzing(true);
    setAnalyzerResult(null);

    const res = await aiService.safenetAnalyzeThreat({
      inputContent: textToAnalyze,
      contentType: analyzerContentType,
    });

    setAnalyzerResult(res?.data || null);
    setIsAnalyzing(false);
    logAction('ANALYZE_THREAT', 'Kiểm chứng an toàn', `Phân tích nội dung (${textToAnalyze.slice(0, 30)}...)`);
  };

  // Generate new scenario by teacher
  const handleGenerateScenario = async () => {
    if (!genTopic.trim()) return;
    setIsGeneratingScenario(true);

    const res = await aiService.safenetGenerateScenario({
      topic: genTopic,
      category: genCategory,
      targetGrade: genGrade,
      difficulty: 'trung_binh',
    });

    if (res?.data) {
      const created = createSafeNetScenario({
        ...res.data,
        createdByType: 'teacher',
        assignedClassIds: ['class_12a1', 'class_12a2'],
      });
      setSelectedSafeNetScenarioId(created.id);
      setActiveTab('simulator');
    }
    setIsGeneratingScenario(false);
  };

  // Create new challenge
  const handleCreateChallenge = () => {
    if (!newChallengeTitle.trim()) return;
    const targetClass = classes.find((c) => c.id === newChallengeClassId) || classes[0];

    createSafeNetChallenge({
      title: newChallengeTitle,
      scenarioId: activeScenario.id,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      classId: targetClass.id,
      className: targetClass.name,
      dueDate: newChallengeDueDate,
      targetPassingScore: 80,
    });

    alert(`Đã giao thử thách "${newChallengeTitle}" cho lớp ${targetClass.name} thành công!`);
  };

  // My attempts summary
  const myAttempts = safeNetAttempts.filter((a) => a.studentId === currentUser.id);
  const avgThreat = myAttempts.length
    ? Math.round(
        myAttempts.reduce((acc, curr) => acc + curr.competencies.threatIdentification, 0) /
          myAttempts.length
      )
    : 92;
  const avgResponse = myAttempts.length
    ? Math.round(
        myAttempts.reduce((acc, curr) => acc + curr.competencies.safeResponse, 0) /
          myAttempts.length
      )
    : 90;
  const avgDataProt = myAttempts.length
    ? Math.round(
        myAttempts.reduce((acc, curr) => acc + curr.competencies.dataProtection, 0) /
          myAttempts.length
      )
    : 95;
  const avgCritical = myAttempts.length
    ? Math.round(
        myAttempts.reduce((acc, curr) => acc + curr.competencies.criticalThinking, 0) /
          myAttempts.length
      )
    : 93;
  const avgCulture = myAttempts.length
    ? Math.round(
        myAttempts.reduce((acc, curr) => acc + curr.competencies.digitalCulture, 0) /
          myAttempts.length
      )
    : 96;

  const currentStage = activeScenario.stages[currentStageIndex] || activeScenario.stages[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner: SafeNet Brand & Slogan */}
      <div className="bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#0D9488] rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <ShieldCheck className="w-80 h-80" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-blue-100 border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Dự án Sáng tạo AI trong học đường • Chủ đề: Ứng dụng AI có trách nhiệm</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              SAFENET AI <span className="text-teal-300 font-black">– LÁ CHẮN CÔNG DÂN SỐ</span>
            </h1>

            <p className="text-blue-100 text-sm sm:text-base font-medium italic">
              "Nhận diện thông minh – Ứng phó an toàn – Làm chủ không gian số."
            </p>

            <p className="text-xs sm:text-sm text-blue-200/90 leading-relaxed">
              Môi trường học tập tương tác mô phỏng các mối nguy hại trên không gian mạng (Lừa đảo OTP,
              Deepfake AI, Tin tức giả mạo, Bắt nạt mạng) dành cho học sinh THPT Nguyễn Dục.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-center">
              <div className="text-xl font-extrabold text-white">{safeNetScenarios.length}</div>
              <div className="text-[11px] text-blue-100 font-medium">Tình huống giả lập</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-center">
              <div className="text-xl font-extrabold text-emerald-300">94.8%</div>
              <div className="text-[11px] text-blue-100 font-medium">Tỷ lệ ứng phó an toàn</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-center col-span-2 sm:col-span-1">
              <div className="text-xl font-extrabold text-amber-300">{safeNetAttempts.length}</div>
              <div className="text-[11px] text-blue-100 font-medium">Lượt hoàn thành</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#2563EB] hover:bg-slate-50'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>1. Đấu trường Phản xạ & Tình huống</span>
          </button>

          <button
            onClick={() => setActiveTab('analyzer')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'analyzer'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#2563EB] hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>2. Trạm Kiểm chứng & Soi Tin Giả</span>
          </button>

          <button
            onClick={() => setActiveTab('competency')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'competency'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#2563EB] hover:bg-slate-50'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>3. Hồ sơ Năng lực Số & Radar</span>
          </button>

          <button
            onClick={() => setActiveTab('teacher')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'teacher'
                ? 'bg-[#1E3A8A] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#1E3A8A] hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>4. Không gian Giáo viên & Thống kê</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportSafeNetCSV('all')}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất báo cáo CSV</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ĐẤU TRƯỜNG PHẢN XẠ & TÌNH HUỐNG GIẢ LẬP                          */}
      {/* ========================================================================= */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (5 cols): Scenario Selector & Context */}
          <div className="lg:col-span-4 space-y-4">
            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm tình huống an toàn số..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px]">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setSelectedCategory('phishing')}
                  className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap cursor-pointer ${
                    selectedCategory === 'phishing'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Lừa đảo OTP
                </button>
                <button
                  onClick={() => setSelectedCategory('deepfake')}
                  className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap cursor-pointer ${
                    selectedCategory === 'deepfake'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Deepfake AI
                </button>
                <button
                  onClick={() => setSelectedCategory('fake_news')}
                  className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap cursor-pointer ${
                    selectedCategory === 'fake_news'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tin tức giả
                </button>
                <button
                  onClick={() => setSelectedCategory('cyberbullying')}
                  className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap cursor-pointer ${
                    selectedCategory === 'cyberbullying'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Bắt nạt & Riêng tư
                </button>
              </div>
            </div>

            {/* Scenario Card List */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredScenarios.map((scen) => {
                const isSelected = scen.id === activeScenario.id;
                const categoryBadge =
                  scen.category === 'phishing'
                    ? { label: 'Lừa đảo OTP', color: 'bg-rose-100 text-rose-700' }
                    : scen.category === 'deepfake'
                    ? { label: 'Deepfake AI', color: 'bg-purple-100 text-purple-700' }
                    : scen.category === 'fake_news'
                    ? { label: 'Tin tức giả', color: 'bg-amber-100 text-amber-700' }
                    : { label: 'An toàn mạng', color: 'bg-blue-100 text-blue-700' };

                return (
                  <div
                    key={scen.id}
                    onClick={() => setSelectedSafeNetScenarioId(scen.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-400 shadow-sm ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:border-blue-200 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${categoryBadge.color}`}>
                        {categoryBadge.label}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {scen.difficulty === 'co_ban' ? 'Cơ bản' : 'Nâng cao'}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-800 line-clamp-2">{scen.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{scen.description}</p>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-blue-500" />
                        {scen.stages.length} màn phản xạ
                      </span>
                      <span className="font-semibold text-blue-600 flex items-center gap-1">
                        {isSelected ? 'Đang thực hiện' : 'Chọn thử thách'}
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (8 cols): Interactive Simulator Workspace */}
          <div className="lg:col-span-8 space-y-6">
            {/* Simulation Header */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                      Màn {currentStageIndex + 1}/{activeScenario.stages.length}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500">{activeScenario.targetGrade}</span>
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-800">{activeScenario.title}</h2>
                  <p className="text-xs text-slate-600 mt-1">{activeScenario.context}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setCurrentStageIndex(0);
                      setDiscoveredRedFlagIds([]);
                      setSelectedChoice(null);
                      setDecisionHistory([]);
                      setIsScenarioFinished(false);
                      setEvaluationData(null);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Làm lại</span>
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                <div
                  className="bg-[#2563EB] h-full transition-all duration-300"
                  style={{
                    width: `${((currentStageIndex + 1) / activeScenario.stages.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Interactive Stage or Finished Screen */}
            {!isScenarioFinished ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Simulated Phone Screen (Messenger / SMS / Zalo UI) */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  {/* Phone Header */}
                  <div className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={activeScenario.senderInfo.avatar}
                          alt="avatar"
                          className="w-9 h-9 rounded-full object-cover border border-white/20"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-800"></span>
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-tight flex items-center gap-1">
                          {activeScenario.senderInfo.name}
                        </div>
                        <div className="text-[10px] text-slate-300">
                          {activeScenario.senderInfo.handleOrNumber} • Nền tảng {activeScenario.senderInfo.platform}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] bg-rose-500/80 text-white font-bold px-2 py-0.5 rounded-full">
                      Mô phỏng rủi ro
                    </span>
                  </div>

                  {/* Message Stream */}
                  <div className="p-4 bg-slate-50 flex-1 space-y-3 min-h-[300px] max-h-[380px] overflow-y-auto">
                    {/* Timestamp */}
                    <div className="text-center">
                      <span className="text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100 shadow-2xs">
                        Hôm nay • {currentStage.timeAgo}
                      </span>
                    </div>

                    {/* Threat Message bubble */}
                    <div className="flex items-start gap-2.5">
                      <img
                        src={activeScenario.senderInfo.avatar}
                        alt="sender"
                        className="w-7 h-7 rounded-full object-cover mt-1 shrink-0"
                      />
                      <div className="bg-white p-3.5 rounded-2xl rounded-tl-xs border border-slate-200 shadow-xs max-w-[85%] text-xs text-slate-800 leading-relaxed space-y-2">
                        <p>{currentStage.promptText}</p>
                      </div>
                    </div>

                    {/* Interactive Red Flag Inspector Box */}
                    <div className="mt-3 bg-amber-50/90 border border-amber-200/90 rounded-xl p-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                          <Eye className="w-3.5 h-3.5 text-amber-600" />
                          <span>Kính lúp Soi Dấu Hiệu Đỏ ({currentStage.redFlags.length} dấu hiệu)</span>
                        </div>
                        <span className="text-[10px] text-amber-700 font-semibold">
                          Bấm để nhận diện nguy cơ
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {currentStage.redFlags.map((rf) => {
                          const isFound = discoveredRedFlagIds.includes(rf.id);
                          return (
                            <button
                              key={rf.id}
                              onClick={() => handleRevealRedFlag(rf)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                isFound
                                  ? 'bg-rose-500 text-white shadow-2xs'
                                  : 'bg-white text-slate-700 border border-amber-200 hover:bg-amber-100/70'
                              }`}
                            >
                              <ShieldAlert className="w-3 h-3" />
                              <span>{rf.label}</span>
                              {isFound && <CheckCircle2 className="w-3 h-3 ml-0.5" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Display explanation of selected red flag */}
                      {activeRedFlagInfo && (
                        <div className="mt-2.5 p-2.5 bg-white rounded-lg border border-amber-200 text-xs text-slate-700 animate-in fade-in">
                          <strong className="text-rose-700">Giải thích nguy cơ: </strong>
                          {activeRedFlagInfo.explanation}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Choices */}
                  <div className="p-4 bg-white border-t border-slate-200 space-y-2.5">
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-blue-600" />
                      <span>Em lựa chọn hành động phản xạ nào?</span>
                    </div>

                    <div className="space-y-2">
                      {currentStage.choices.map((choice) => {
                        const isChosen = selectedChoice?.id === choice.id;
                        return (
                          <div
                            key={choice.id}
                            onClick={() => handleSelectChoice(choice)}
                            className={`p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer flex items-start gap-2.5 ${
                              isChosen
                                ? choice.isSafeAction
                                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-1 ring-emerald-500'
                                  : 'bg-rose-50 border-rose-400 text-rose-950 ring-1 ring-rose-500'
                                : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-white hover:border-blue-300'
                            }`}
                          >
                            <div className="mt-0.5">
                              {isChosen ? (
                                choice.isSafeAction ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-rose-600" />
                                )
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-slate-300"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div>{choice.text}</div>
                              {isChosen && (
                                <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 text-[11px] font-normal leading-relaxed text-slate-600">
                                  <strong>Phản hồi sư phạm: </strong>
                                  {choice.aiMentorFeedback}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={handleProceedStage}
                        disabled={!selectedChoice}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                          selectedChoice
                            ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/25 hover:bg-blue-700'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <span>
                          {currentStageIndex + 1 < activeScenario.stages.length
                            ? 'Tiếp tục giai đoạn tiếp theo'
                            : 'Hoàn thành thử thách & Xem đánh giá AI'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Sub-Panel: AI Simulation Chat (Chat with Scammer bot OR Cyber Mentor) */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[580px]">
                  {/* Chat Switcher */}
                  <div className="p-3 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                      <button
                        onClick={() => setChatRole('scammer')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          chatRole === 'scammer'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-800'
                        }`}
                      >
                        Đấu trí Kẻ lừa đảo
                      </button>
                      <button
                        onClick={() => setChatRole('mentor')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          chatRole === 'mentor'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-800'
                        }`}
                      >
                        Hỏi Cyber Mentor
                      </button>
                    </div>

                    <div className="text-[10px] text-slate-400 font-semibold">Gemini 3.8 Flash</div>
                  </div>

                  {/* Chat Message List */}
                  <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-slate-50/40 text-xs">
                    {chatMessages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[10px] text-slate-400 mb-0.5 px-1">{m.sender}</span>
                        <div
                          className={`p-3 rounded-2xl max-w-[90%] leading-relaxed ${
                            m.role === 'user'
                              ? 'bg-[#2563EB] text-white rounded-tr-xs'
                              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-2xs'
                          }`}
                        >
                          {m.text}
                        </div>
                      </div>
                    ))}

                    {isAiReplying && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 italic p-2">
                        <Bot className="w-3.5 h-3.5 animate-spin" />
                        <span>AI đang soạn phản hồi...</span>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Chat Input */}
                  <div className="p-3 bg-white border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={
                          chatRole === 'scammer'
                            ? 'Thử nhắn chất vấn hoặc từ chối bẫy lừa...'
                            : 'Hỏi thầy/cô Cyber Mentor về cách nhận diện...'
                        }
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                        className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleSendChatMessage}
                        disabled={isAiReplying || !chatInput.trim()}
                        className="p-2 rounded-xl bg-[#2563EB] text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Mô hình thử thách phản xạ ngôn ngữ thực tế</span>
                      <span>Học sinh tự làm, AI hỗ trợ</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Finished Evaluation Screen */
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-md animate-in zoom-in-95">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <Award className="w-9 h-9" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-800">
                    Hoàn thành Thử thách An toàn số!
                  </h2>
                  <p className="text-sm text-slate-500">
                    Tình huống: <strong>{activeScenario.title}</strong>
                  </p>
                </div>

                {evaluatingResult ? (
                  <div className="py-12 text-center space-y-3">
                    <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                    <p className="text-sm font-semibold text-slate-600">
                      Chuyên gia AI đang phân tích dữ liệu phản xạ và chấm điểm 5 trụ cột năng lực số...
                    </p>
                  </div>
                ) : (
                  evaluationData && (
                    <div className="space-y-6">
                      {/* Score and Badge Banner */}
                      <div className="bg-gradient-to-r from-blue-50 via-teal-50 to-emerald-50 rounded-2xl p-5 border border-blue-200 flex items-center justify-between flex-wrap gap-4">
                        <div>
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Tổng điểm phản xạ
                          </div>
                          <div className="text-3xl font-black text-[#2563EB]">
                            {evaluationData.competencies?.safeResponse || 95}/100
                          </div>
                          <div className="text-xs text-slate-600 font-medium mt-0.5">
                            Học sinh: <strong>{currentUser.name}</strong> • Lớp {currentUser.className || '12A1'}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-slate-500 block">Huy hiệu vinh danh</span>
                          <span className="inline-flex items-center gap-1.5 bg-amber-400 text-blue-950 font-black text-xs px-3 py-1.5 rounded-xl shadow-xs mt-1">
                            <Award className="w-4 h-4 text-blue-950" />
                            {evaluationData.earnedBadge || 'Lá chắn Vàng An toàn số'}
                          </span>
                        </div>
                      </div>

                      {/* 5 Digital Competency Metrics */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                          Đánh giá 5 Trụ cột Năng lực An toàn số (Digital Competencies)
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex justify-between text-xs font-bold mb-1">
                              <span className="text-slate-700">1. Nhận diện nguy cơ</span>
                              <span className="text-blue-600">
                                {evaluationData.competencies?.threatIdentification}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-blue-600 h-full"
                                style={{ width: `${evaluationData.competencies?.threatIdentification}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex justify-between text-xs font-bold mb-1">
                              <span className="text-slate-700">2. Ứng phó an toàn</span>
                              <span className="text-emerald-600">
                                {evaluationData.competencies?.safeResponse}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full"
                                style={{ width: `${evaluationData.competencies?.safeResponse}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex justify-between text-xs font-bold mb-1">
                              <span className="text-slate-700">3. Bảo vệ dữ liệu PII</span>
                              <span className="text-purple-600">
                                {evaluationData.competencies?.dataProtection}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-purple-600 h-full"
                                style={{ width: `${evaluationData.competencies?.dataProtection}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex justify-between text-xs font-bold mb-1">
                              <span className="text-slate-700">4. Tư duy phản biện số</span>
                              <span className="text-amber-600">
                                {evaluationData.competencies?.criticalThinking}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-amber-500 h-full"
                                style={{ width: `${evaluationData.competencies?.criticalThinking}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 col-span-1 sm:col-span-2 md:col-span-1">
                            <div className="flex justify-between text-xs font-bold mb-1">
                              <span className="text-slate-700">5. Văn hóa & Đạo đức mạng</span>
                              <span className="text-teal-600">
                                {evaluationData.competencies?.digitalCulture}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-teal-500 h-full"
                                style={{ width: `${evaluationData.competencies?.digitalCulture}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* AI Pedagogical Feedback & SIFT Guide */}
                      <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                          <Bot className="w-4 h-4 text-blue-600" />
                          <span>Nhận xét sư phạm từ Chuyên gia SafeNet AI</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {evaluationData.aiEvaluationSummary}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                          <div className="p-3 bg-white rounded-xl border border-blue-100">
                            <div className="font-bold text-emerald-700 mb-1 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Điểm mạnh ghi nhận:
                            </div>
                            <ul className="list-disc pl-4 space-y-1 text-slate-600">
                              {evaluationData.aiStrengths?.map((str: string, i: number) => (
                                <li key={i}>{str}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-3 bg-white rounded-xl border border-blue-100">
                            <div className="font-bold text-amber-700 mb-1 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> Điểm cần lưu ý thêm:
                            </div>
                            <ul className="list-disc pl-4 space-y-1 text-slate-600">
                              {evaluationData.aiAreasToImprove?.map((imp: string, i: number) => (
                                <li key={i}>{imp}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* SIFT Formula Review */}
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                        <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Quy tắc 4 bước SIFT để luôn an toàn trên mạng:</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                            <strong className="text-rose-600 block">S - Stop</strong>
                            <span className="text-[11px] text-slate-600">
                              {activeScenario.siftGuide.stop}
                            </span>
                          </div>
                          <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                            <strong className="text-blue-600 block">I - Investigate</strong>
                            <span className="text-[11px] text-slate-600">
                              {activeScenario.siftGuide.investigate}
                            </span>
                          </div>
                          <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                            <strong className="text-amber-600 block">F - Find</strong>
                            <span className="text-[11px] text-slate-600">
                              {activeScenario.siftGuide.find}
                            </span>
                          </div>
                          <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                            <strong className="text-emerald-600 block">T - Trace</strong>
                            <span className="text-[11px] text-slate-600">
                              {activeScenario.siftGuide.trace}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Actions */}
                      <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200 flex-wrap">
                        <button
                          onClick={() => {
                            setCurrentStageIndex(0);
                            setDiscoveredRedFlagIds([]);
                            setSelectedChoice(null);
                            setDecisionHistory([]);
                            setIsScenarioFinished(false);
                            setEvaluationData(null);
                          }}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Luyện tập lại tình huống này
                        </button>

                        <button
                          onClick={() => setActiveTab('competency')}
                          className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <span>Xem Hồ sơ Năng lực Số</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TRẠM KIỂM CHỨNG & SOI TIN GIẢ (FACT-CHECK & THREAT ANALYZER)     */}
      {/* ========================================================================= */}
      {activeTab === 'analyzer' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Trạm Kiểm chứng Tin tức & Phân tích Độc hại (AI Cyber Threat Intelligence)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Dán bất kỳ đường liên kết URL lạ, tin nhắn Zalo/SMS nghi ngờ trúng thưởng, hoặc bài đăng
                mạng xã hội để AI phân tích rủi ro, đòn tâm lý thao túng và hướng dẫn xử lý theo mô hình SIFT.
              </p>
            </div>

            {/* Content Type Selector */}
            <div className="flex gap-2 flex-wrap text-xs">
              {[
                'Tin nhắn / Đường link nghi vấn',
                'Bài viết mạng xã hội giật gân',
                'Lời mời việc làm online / Nạp cọc',
                'Cuộc gọi khẩn cấp mượn tiền',
              ].map((type) => (
                <button
                  key={type}
                  onClick={() => setAnalyzerContentType(type)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    analyzerContentType === type
                      ? 'bg-blue-50 text-[#2563EB] border border-blue-300'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Input Textarea */}
            <div>
              <textarea
                rows={4}
                value={analyzerInput}
                onChange={(e) => setAnalyzerInput(e.target.value)}
                placeholder="Dán nội dung tin nhắn, bài viết hoặc link tại đây (ví dụ: 'Chúc mừng bạn trúng giải thưởng 50 triệu từ Shopee, hãy bấm vào bit.ly/qua-tang để xác nhận mã OTP...')"
                className="w-full p-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
              />
            </div>

            {/* Preset Samples */}
            <div className="flex items-center gap-2 flex-wrap text-[11px]">
              <span className="font-semibold text-slate-500">Mẫu thử nhanh:</span>
              <button
                onClick={() => {
                  const text =
                    'CHÚC MỪNG BẠN! Số điện thoại của bạn trúng xe máy Honda SH 150i. Truy cập http://honda-triankhachhang2025.xyz/nhan-thuong và nộp phí làm hồ sơ 200k qua thẻ cào.';
                  setAnalyzerInput(text);
                  handleRunThreatAnalyzer(text);
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 cursor-pointer"
              >
                1. Trúng thưởng xe SH .xyz
              </button>
              <button
                onClick={() => {
                  const text =
                    'Khẩn cấp! Vỡ đê sông Hồng đợt bão lũ mới nhất, chính quyền đang sơ tán khẩn cấp. Mọi người gửi tiền ủng hộ trực tiếp vào STK cá nhân: 12345678 - NGUYEN VAN A.';
                  setAnalyzerInput(text);
                  handleRunThreatAnalyzer(text);
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 cursor-pointer"
              >
                2. Tin giả vỡ đê kêu gọi từ thiện
              </button>
              <button
                onClick={() => {
                  const text =
                    'Bình chọn cho em gái mình thi Duyên Dáng Học Đường THPT với nhé! Link đăng nhập nick Facebook để vote: http://cuocthibinhchon-thpt.site';
                  setAnalyzerInput(text);
                  handleRunThreatAnalyzer(text);
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 cursor-pointer"
              >
                3. Link bình chọn hoa khôi giả mạo
              </button>
            </div>

            {/* Analyze Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => handleRunThreatAnalyzer()}
                disabled={isAnalyzing || !analyzerInput.trim()}
                className="px-6 py-2.5 rounded-xl bg-[#2563EB] text-white hover:bg-blue-700 font-extrabold text-xs shadow-md shadow-blue-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>AI đang phân tích mối đe dọa...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Phân tích Mối đe dọa Số</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Analysis Results Display */}
          {analyzerResult && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                      analyzerResult.riskLevel === 'Cao'
                        ? 'bg-rose-100 text-rose-600'
                        : analyzerResult.riskLevel === 'Trung bình'
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-emerald-100 text-emerald-600'
                    }`}
                  >
                    {analyzerResult.riskScore}/100
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 uppercase">Mức độ rủi ro:</span>
                      <span
                        className={`text-xs font-extrabold px-2.5 py-0.5 rounded-md ${
                          analyzerResult.riskLevel === 'Cao'
                            ? 'bg-rose-600 text-white'
                            : analyzerResult.riskLevel === 'Trung bình'
                            ? 'bg-amber-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {analyzerResult.riskLevel}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">
                      {analyzerResult.threatCategory}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-500">
                  Công nghệ thẩm định: <strong>Gemini 3.8 Flash</strong>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Red Flags */}
                <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2">
                  <div className="font-bold text-rose-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>Các dấu hiệu đỏ (Red Flags) được phát hiện:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5 text-rose-950">
                    {analyzerResult.redFlags?.map((rf: string, i: number) => (
                      <li key={i}>{rf}</li>
                    ))}
                  </ul>
                </div>

                {/* Psychological Tricks */}
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Đòn tâm lý học kẻ xấu lợi dụng:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5 text-amber-950">
                    {analyzerResult.psychologicalTricks?.map((pt: string, i: number) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actionable Steps & SIFT */}
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3 text-xs">
                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Khuyến nghị hành động tức thì cho học sinh:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {analyzerResult.actionableSteps?.map((step: string, i: number) => (
                    <div key={i} className="p-2.5 bg-white rounded-lg border border-blue-100 text-slate-700">
                      <strong>Bước {i + 1}: </strong>
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pedagogical Explanation */}
              <div className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <strong className="text-slate-800">Lời giải thích sư phạm: </strong>
                {analyzerResult.detailedExplanation}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: HỒ SƠ NĂNG LỰC SỐ & RADAR (STUDENT PORTFOLIO)                    */}
      {/* ========================================================================= */}
      {activeTab === 'competency' && (
        <div className="space-y-6">
          {/* Overview Competency Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">
                  Hồ sơ Năng lực Công dân số (Digital Citizenship Portfolio)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Đánh giá toàn diện theo 5 trụ cột năng lực số chuẩn giáo dục an toàn mạng học đường THPT.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-700">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-400">
                    Lớp {currentUser.className || '12A1'} • THPT Nguyễn Dục
                  </div>
                </div>
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                />
              </div>
            </div>

            {/* 5 Competencies Radar Visualization */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl text-center space-y-2">
                <span className="text-[11px] font-bold text-blue-700 uppercase">1. Nhận diện nguy cơ</span>
                <div className="text-2xl font-black text-blue-900">{avgThreat}%</div>
                <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full" style={{ width: `${avgThreat}%` }}></div>
                </div>
                <p className="text-[10px] text-slate-500">Phát hiện bẫy lừa, link độc, OTP giả mạo</p>
              </div>

              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-center space-y-2">
                <span className="text-[11px] font-bold text-emerald-700 uppercase">2. Ứng phó an toàn</span>
                <div className="text-2xl font-black text-emerald-900">{avgResponse}%</div>
                <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full" style={{ width: `${avgResponse}%` }}></div>
                </div>
                <p className="text-[10px] text-slate-500">Bình tĩnh dừng lại, báo cáo đúng kênh</p>
              </div>

              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl text-center space-y-2">
                <span className="text-[11px] font-bold text-purple-700 uppercase">3. Bảo vệ dữ liệu PII</span>
                <div className="text-2xl font-black text-purple-900">{avgDataProt}%</div>
                <div className="w-full bg-purple-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full" style={{ width: `${avgDataProt}%` }}></div>
                </div>
                <p className="text-[10px] text-slate-500">Bảo mật mật khẩu, 2FA, OTP bí mật</p>
              </div>

              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-center space-y-2">
                <span className="text-[11px] font-bold text-amber-700 uppercase">4. Phản biện số SIFT</span>
                <div className="text-2xl font-black text-amber-900">{avgCritical}%</div>
                <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-600 h-full" style={{ width: `${avgCritical}%` }}></div>
                </div>
                <p className="text-[10px] text-slate-500">Kiểm chứng nguồn tin, không bị dắt mũi</p>
              </div>

              <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl text-center space-y-2">
                <span className="text-[11px] font-bold text-teal-700 uppercase">5. Văn hóa mạng</span>
                <div className="text-2xl font-black text-teal-900">{avgCulture}%</div>
                <div className="w-full bg-teal-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-600 h-full" style={{ width: `${avgCulture}%` }}></div>
                </div>
                <p className="text-[10px] text-slate-500">Chống bạo lực mạng, bảo vệ bạn bè</p>
              </div>
            </div>

            {/* Earned Badges Collection */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Bộ sưu tập Huy hiệu Công dân số đạt được</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                    🛡️
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-800">Lá chắn Vàng An toàn số</div>
                    <div className="text-[10px] text-slate-400">Đạt điểm phản xạ &gt; 95đ</div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                    🕵️‍♂️
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-800">Phá bẫy Deepfake AI</div>
                    <div className="text-[10px] text-slate-400">Xác thực kênh thoại SIM</div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    📰
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-800">Dũng sĩ Bác bỏ Tin giả</div>
                    <div className="text-[10px] text-slate-400">Áp dụng thuần thục SIFT</div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    🤝
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-800">Vệ binh Văn hóa mạng</div>
                    <div className="text-[10px] text-slate-400">Ngăn chặn bắt nạt học đường</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attempt History Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Lịch sử rèn luyện phản xạ gần đây ({safeNetAttempts.length} lượt)
              </h3>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Học sinh</th>
                      <th className="py-2.5 px-3">Lớp</th>
                      <th className="py-2.5 px-3">Tình huống</th>
                      <th className="py-2.5 px-3">Điểm số</th>
                      <th className="py-2.5 px-3">Huy hiệu</th>
                      <th className="py-2.5 px-3">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {safeNetAttempts.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{att.studentName}</td>
                        <td className="py-2.5 px-3 text-slate-500">{att.className}</td>
                        <td className="py-2.5 px-3 text-slate-700 font-medium">{att.scenarioTitle}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-md font-extrabold text-[11px] ${
                              att.totalScore >= 90
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {att.totalScore}đ
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-amber-700 font-bold">{att.earnedBadge || 'Công dân số'}</td>
                        <td className="py-2.5 px-3 text-slate-400">{att.completedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: KHÔNG GIAN GIÁO VIÊN & QUẢN LÝ THỬ THÁCH (TEACHER HUB)           */}
      {/* ========================================================================= */}
      {activeTab === 'teacher' && (
        <div className="space-y-6">
          {/* Teacher AI Scenario Generator */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
                  Dành cho Giáo viên Tin học / Ban Giám hiệu
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500">Cô Trần Thị Tuyết Nhung</span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-600" />
                <span>AI Sáng tạo Kịch bản Tình huống Mới (AI Scenario Generator)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Giáo viên chỉ cần nhập chủ đề nguy cơ mạng thực tế tại địa phương, AI Gemini sẽ tự động
                thiết kế tình huống giả lập nhiều giai đoạn, câu hỏi hành vi, dấu hiệu đỏ và bài học SIFT.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">Chủ đề tình huống mong muốn</label>
                <input
                  type="text"
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  placeholder="Ví dụ: Lừa đảo chuyển khoản tiền quỹ lớp, hack tài khoản mạng xã hội..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Thể loại mối đe dọa</label>
                <select
                  value={genCategory}
                  onChange={(e) => setGenCategory(e.target.value as SafeNetCategory)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="phishing">Lừa đảo trực tuyến (Phishing)</option>
                  <option value="deepfake">Deepfake AI & Mạo danh</option>
                  <option value="fake_news">Tin tức giả & Sai lệch</option>
                  <option value="cyberbullying">Bắt nạt mạng & Dữ liệu riêng tư</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleGenerateScenario}
                disabled={isGeneratingScenario || !genTopic.trim()}
                className="px-5 py-2.5 rounded-xl bg-[#2563EB] text-white hover:bg-blue-700 font-bold text-xs shadow-md shadow-blue-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingScenario ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Gemini đang sinh kịch bản giáo dục...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Tạo tình huống mới bằng AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Assign Challenge to Class */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Giao Thử thách An toàn số cho Lớp học</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Tiêu đề thử thách</label>
                <input
                  type="text"
                  value={newChallengeTitle}
                  onChange={(e) => setNewChallengeTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Lớp được giao</label>
                <select
                  value={newChallengeClassId}
                  onChange={(e) => setNewChallengeClassId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.subject})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Hạn hoàn thành</label>
                <input
                  type="date"
                  value={newChallengeDueDate}
                  onChange={(e) => setNewChallengeDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleCreateChallenge}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Giao thử thách ngay
              </button>
            </div>
          </div>

          {/* Class Analytics & Assigned Challenges List */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-base font-extrabold text-slate-800">
                Danh sách Thử thách đang kích hoạt ({safeNetChallenges.length})
              </h3>
              <button
                onClick={() => exportSafeNetCSV('all')}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold border border-blue-200 flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất bảng tổng hợp kết quả (CSV)</span>
              </button>
            </div>

            <div className="space-y-3">
              {safeNetChallenges.map((chal) => (
                <div
                  key={chal.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between flex-wrap gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{chal.title}</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-bold text-[10px]">
                        Lớp {chal.className}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Giáo viên giao: <strong>{chal.teacherName}</strong> • Hạn: {chal.dueDate} • Điểm đạt yêu cầu: {chal.targetPassingScore}đ
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Đang mở thử thách
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
