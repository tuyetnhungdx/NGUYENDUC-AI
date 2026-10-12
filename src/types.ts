export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  classId?: string; // For students
  className?: string;
  school: string;
  bio?: string;
  joinedDate: string;
  username?: string;
  password?: string;
}

export interface ClassRoom {
  id: string;
  name: string; // e.g. "12A1"
  subject: string; // "Tin học 12"
  grade: string; // "12"
  academicYear: string; // "2024 - 2025"
  code: string; // e.g. "ND-12A1-TH"
  teacherId: string;
  teacherName: string;
  studentCount: number;
  description: string;
  color: string;
  bannerGradient: string;
  announcements: Array<{
    id: string;
    title: string;
    content: string;
    createdAt: string;
    authorName: string;
  }>;
}

export interface RubricItem {
  id: string;
  name: string;
  weight: number; // in percent e.g. 20
  maxPoints: number; // e.g. 2.0
  description: string;
  expectedStructure?: string;
}

export interface Assignment {
  id: string;
  title: string; // "Tin học 12 – Bài 9: Tạo danh sách, bảng"
  classId: string;
  className: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  description: string;
  requirements: string[];
  rubric: RubricItem[];
  maxScore: number;
  startDate: string;
  dueDate: string;
  status: 'draft' | 'published' | 'closed';
  allowedResubmissions: number; // e.g. 3
  aiAssistantEnabled: boolean;
  aiSupportLevel: 'full' | 'moderate' | 'minimal';
  starterTemplate?: string;
  isDemo?: boolean;
  maxFileSizeMb?: number; // e.g. 20
  allowedExtensions?: string[]; // e.g. ['pdf', 'docx', 'pptx', 'xlsx', 'jpg', 'png', 'html', 'css', 'js', 'py', 'zip']
}

export interface SubmissionFile {
  id: string;
  fileName: string;
  fileSize: number; // in bytes
  fileType: string;
  storagePath: string;
  storageUrl: string;
  uploadedAt: string;
  contentSnapshot?: string; // Content of text/HTML for instant AI 4C diagnosis
  isSupabase?: boolean;
}

export interface ExternalLink {
  id: string;
  title: string;
  url: string;
  type: 'google_drive' | 'canva' | 'video' | 'other';
}

export interface DiagnosticIssue {
  element: string;
  line?: number;
  priority: 'high' | 'medium' | 'low';
  level1Hint: string; // Nhận diện lỗi
  level2Hint: string; // Gợi ý kiến thức
  level3Hint: string; // Hướng dẫn sâu hơn
}

export interface RubricEvaluation {
  criteria: string;
  status: 'passed' | 'partial' | 'failed';
  comment: string;
  points?: number;
}

export interface AIFeedback4C {
  timestamp: string;
  summary: string;
  scoreEstimate: number;
  passedCriteria: string[];
  improvedCriteria: string[];
  issues: DiagnosticIssue[];
  rubricResults: RubricEvaluation[];
  pedagogicalPraise: string;
  hintsUsedCount: number;
  unlockedHintLevels: Record<number, number>; // issueIndex -> unlockedLevel (1, 2, or 3)
}

export interface SubmissionVersion {
  versionNumber: number;
  submittedAt: string;
  htmlContent: string;
  notes?: string;
  attachedFiles?: SubmissionFile[];
  externalLinks?: ExternalLink[];
  aiFeedback?: AIFeedback4C;
  resolvedIssuesCount?: number;
  unresolvedIssuesCount?: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  studentCode: string; // e.g. "HS1201"
  classId: string;
  className: string;
  status: 'not_started' | 'in_progress' | 'draft' | 'submitted' | 'needs_revision' | 'completed';
  versions: SubmissionVersion[];
  currentVersion: number;
  attachedFiles?: SubmissionFile[];
  externalLinks?: ExternalLink[];
  notes?: string;
  isDraft?: boolean;
  submittedAt?: string;
  teacherGrade?: number;
  teacherComment?: string;
  teacherReviewedAt?: string;
  isConfirmedByTeacher: boolean;
  totalTimeMinutes: number;
}

export interface DiscussionComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  authorAvatar: string;
  content: string;
  createdAt: string;
  isHelpful?: boolean;
}

export interface DiscussionPost {
  id: string;
  classId: string;
  className: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  authorAvatar: string;
  title: string;
  content: string;
  category: 'bai_tap' | 'ly_thuyet' | 'thao_luan_chung' | 'gop_y';
  tags: string[];
  createdAt: string;
  likes: number;
  comments: DiscussionComment[];
  isPinned?: boolean;
  isSolved?: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'assignment' | 'feedback' | 'forum' | 'system';
  linkTarget?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: Role;
  action: string;
  target: string;
  details: string;
  ipAddress?: string;
}

export interface AIUsageStat {
  totalQueries: number;
  diagnosticCount: number;
  tutorQueries: number;
  teacherQueries: number;
  quotaLimitDaily: number;
  quotaUsedToday: number;
}

// ==========================================
// SAFENET AI – LÁ CHẮN CÔNG DÂN SỐ
// ==========================================

export type SafeNetCategory =
  | 'phishing'
  | 'fake_news'
  | 'impersonation'
  | 'cyberbullying'
  | 'data_privacy'
  | 'deepfake';

export type SafeNetDifficulty = 'co_ban' | 'trung_binh' | 'nang_cao';

export interface SafeNetChoice {
  id: string;
  text: string;
  isSafeAction: boolean;
  score: number;
  aiMentorFeedback: string;
  competencyImpact: {
    threatIdentification: number;
    safeResponse: number;
    dataProtection: number;
    criticalThinking: number;
    digitalCulture: number;
  };
}

export interface SafeNetRedFlag {
  id: string;
  label: string;
  explanation: string;
}

export interface SafeNetStage {
  stageId: number;
  promptText: string;
  timeAgo: string;
  mediaUrl?: string;
  redFlags: SafeNetRedFlag[];
  choices: SafeNetChoice[];
}

export interface SafeNetScenario {
  id: string;
  title: string;
  category: SafeNetCategory;
  difficulty: SafeNetDifficulty;
  description: string;
  senderInfo: {
    name: string;
    avatar: string;
    handleOrNumber: string;
    platform: 'Zalo' | 'Messenger' | 'Email' | 'SMS' | 'TikTok' | 'Facebook';
    verifiedBadge?: boolean;
  };
  context: string;
  stages: SafeNetStage[];
  learningTakeaways: string[];
  siftGuide: {
    stop: string;
    investigate: string;
    find: string;
    trace: string;
  };
  createdByType: 'teacher' | 'ai_system';
  targetGrade: string;
  assignedClassIds: string[];
}

export interface SafeNetStudentAttempt {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  category: SafeNetCategory;
  studentId: string;
  studentName: string;
  className: string;
  completedAt: string;
  totalScore: number;
  decisionPath: Array<{
    stageId: number;
    choiceId: string;
    choiceText: string;
    isSafe: boolean;
  }>;
  identifiedRedFlagIds: string[];
  aiEvaluationSummary: string;
  aiStrengths: string[];
  aiAreasToImprove: string[];
  competencies: {
    threatIdentification: number;
    safeResponse: number;
    dataProtection: number;
    criticalThinking: number;
    digitalCulture: number;
  };
  earnedBadge?: string;
}

export interface SafeNetChallenge {
  id: string;
  title: string;
  scenarioId: string;
  teacherId: string;
  teacherName: string;
  classId: string;
  className: string;
  dueDate: string;
  status: 'active' | 'completed' | 'expired';
  targetPassingScore: number;
}

export interface SafeNetChatMessage {
  id: string;
  role: 'user' | 'model' | 'scammer' | 'mentor';
  text: string;
  timestamp: string;
  feedbackHint?: string;
}
