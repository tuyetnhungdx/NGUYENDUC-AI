import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Role,
  ClassRoom,
  Assignment,
  Submission,
  SubmissionVersion,
  DiscussionPost,
  AuditLog,
  NotificationItem,
  AIFeedback4C,
  SafeNetScenario,
  SafeNetStudentAttempt,
  SafeNetChallenge,
  SubmissionFile,
  ExternalLink,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CLASSES,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_DISCUSSIONS,
  INITIAL_AUDIT_LOGS,
  DEMO_FLAWED_HTML,
} from '../data/mockData';
import {
  INITIAL_SAFENET_SCENARIOS,
  INITIAL_SAFENET_ATTEMPTS,
  INITIAL_SAFENET_CHALLENGES,
} from '../data/safeNetData';
import { aiService } from '../services/aiService';
import { getSupabaseClient } from '../services/supabaseClient';

interface AppContextType {
  isAuthenticated: boolean;
  loginWithCredentials: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; message: string; user?: User }>;
  registerWithCredentials: (
    username: string,
    password: string,
    role?: Role,
    name?: string
  ) => Promise<{ success: boolean; message: string; user?: User }>;
  logoutUser: () => void;
  currentUser: User;
  users: User[];
  classes: ClassRoom[];
  assignments: Assignment[];
  submissions: Submission[];
  discussions: DiscussionPost[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  serverHealth: { hasGeminiKey: boolean; model: string; status: string };
  activeView: string;
  setActiveView: (view: string) => void;
  selectedAssignmentId: string | null;
  setSelectedAssignmentId: (id: string | null) => void;
  selectedSubmissionId: string | null;
  setSelectedSubmissionId: (id: string | null) => void;
  // SafeNet AI
  safeNetScenarios: SafeNetScenario[];
  safeNetAttempts: SafeNetStudentAttempt[];
  safeNetChallenges: SafeNetChallenge[];
  selectedSafeNetScenarioId: string | null;
  setSelectedSafeNetScenarioId: (id: string | null) => void;
  addSafeNetAttempt: (
    attempt: Omit<SafeNetStudentAttempt, 'id' | 'completedAt'>
  ) => SafeNetStudentAttempt;
  createSafeNetScenario: (scenario: Omit<SafeNetScenario, 'id'>) => SafeNetScenario;
  createSafeNetChallenge: (
    challenge: Omit<SafeNetChallenge, 'id' | 'status'>
  ) => SafeNetChallenge;
  exportSafeNetCSV: (filterClassId?: string) => void;
  loginUser: (user: User) => void;
  switchRole: (role: Role) => void;
  addClass: (newClass: Omit<ClassRoom, 'id' | 'studentCount' | 'announcements'>) => ClassRoom;
  joinClassByCode: (code: string) => { success: boolean; message: string; classItem?: ClassRoom };
  createAssignment: (asg: Partial<Assignment>) => Assignment;
  submitNewVersion: (
    assignmentId: string,
    htmlContent: string,
    notes?: string,
    aiFeedback?: AIFeedback4C
  ) => { submission: Submission; versionNumber: number };
  submitAssignmentFiles: (payload: {
    assignmentId: string;
    files: SubmissionFile[];
    externalLinks?: ExternalLink[];
    notes?: string;
    isDraft?: boolean;
    htmlContent?: string;
  }) => { submission: Submission; isNewVersion: boolean };
  saveDiagnosticFeedback: (
    submissionId: string,
    versionNumber: number,
    feedback: AIFeedback4C
  ) => void;
  teacherConfirmGrade: (
    submissionId: string,
    grade: number,
    comment: string
  ) => void;
  addDiscussionPost: (title: string, content: string, category: any, tags: string[], classId: string) => void;
  addDiscussionComment: (postId: string, content: string) => void;
  markCommentHelpful: (postId: string, commentId: string) => void;
  toggleLikePost: (postId: string) => void;
  exportSubmissionsCSV: (filterClassId?: string) => void;
  resetToInitialDemo: () => void;
  logAction: (action: string, target: string, details: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistence via localStorage with fallback to initial data
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('nd_users');
    const list: User[] = saved ? JSON.parse(saved) : INITIAL_USERS;
    return list.map((u) =>
      u.id === 'user_teacher_1'
        ? {
            ...u,
            name: 'Cô Trần Thị Tuyết Nhung',
            email: 'nhung.ttt@thptnguyenduc.edu.vn',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
            bio: 'Giáo viên Tin học',
          }
        : u
    );
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('nd_current_user');
    const user: User = saved ? JSON.parse(saved) : INITIAL_USERS[1];
    if (user.id === 'user_teacher_1') {
      return {
        ...user,
        name: 'Cô Trần Thị Tuyết Nhung',
        email: 'nhung.ttt@thptnguyenduc.edu.vn',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        bio: 'Giáo viên Tin học',
      };
    }
    return user;
  });

  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    const saved = localStorage.getItem('nd_classes');
    const list: ClassRoom[] = saved ? JSON.parse(saved) : INITIAL_CLASSES;
    return list.map((c) => ({
      ...c,
      teacherName: 'Cô Trần Thị Tuyết Nhung',
    }));
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('nd_assignments');
    const list: Assignment[] = saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
    return list.map((a) => ({
      ...a,
      teacherName: 'Cô Trần Thị Tuyết Nhung',
    }));
  });

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem('nd_submissions');
    return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
  });

  const [discussions, setDiscussions] = useState<DiscussionPost[]>(() => {
    const saved = localStorage.getItem('nd_discussions');
    return saved ? JSON.parse(saved) : INITIAL_DISCUSSIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('nd_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif_1',
      userId: 'user_student_1',
      title: 'Đã có kết quả đánh giá Bài 9',
      message: 'Cô Trần Thị Tuyết Nhung đã xác nhận điểm 9.5 cho bài thực hành của em!',
      time: '15 phút trước',
      read: false,
      type: 'feedback',
    },
    {
      id: 'notif_2',
      userId: 'user_student_1',
      title: 'Nhiệm vụ mới Tin học 12',
      message: 'Bài 9: Tạo danh sách, bảng đã mở nộp bài với Trợ lý AI 4C.',
      time: 'Hôm qua',
      read: true,
      type: 'assignment',
    },
  ]);

  const [serverHealth, setServerHealth] = useState({
    hasGeminiKey: false,
    model: 'gemini-3.8-flash',
    status: 'checking',
  });

  // Navigation view: 'landing', 'competition', 'teacher_dashboard', 'student_dashboard', 'workspace', 'reviewer_4c', 'tutor_chat', 'teacher_ai', 'discussions', 'analytics', 'responsible_ai', 'admin_dashboard'
  const [activeView, setActiveView] = useState<string>('landing');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>('asg_bai9_html');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>('sub_1201_bai9');

  // SafeNet AI State
  const [safeNetScenarios, setSafeNetScenarios] = useState<SafeNetScenario[]>(() => {
    const saved = localStorage.getItem('nd_safenet_scenarios');
    return saved ? JSON.parse(saved) : INITIAL_SAFENET_SCENARIOS;
  });
  const [safeNetAttempts, setSafeNetAttempts] = useState<SafeNetStudentAttempt[]>(() => {
    const saved = localStorage.getItem('nd_safenet_attempts');
    return saved ? JSON.parse(saved) : INITIAL_SAFENET_ATTEMPTS;
  });
  const [safeNetChallenges, setSafeNetChallenges] = useState<SafeNetChallenge[]>(() => {
    const saved = localStorage.getItem('nd_safenet_challenges');
    return saved ? JSON.parse(saved) : INITIAL_SAFENET_CHALLENGES;
  });
  const [selectedSafeNetScenarioId, setSelectedSafeNetScenarioId] = useState<string | null>(
    INITIAL_SAFENET_SCENARIOS[0]?.id || null
  );

  // Check server health on mount
  useEffect(() => {
    aiService.checkHealth().then((res) => {
      setServerHealth({
        hasGeminiKey: Boolean(res.hasGeminiKey),
        model: res.model || 'gemini-3.8-flash',
        status: res.status || 'ok',
      });
    });
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('nd_users', JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem('nd_current_user', JSON.stringify(currentUser));
  }, [currentUser]);
  useEffect(() => {
    localStorage.setItem('nd_classes', JSON.stringify(classes));
  }, [classes]);
  useEffect(() => {
    localStorage.setItem('nd_assignments', JSON.stringify(assignments));
  }, [assignments]);
  useEffect(() => {
    localStorage.setItem('nd_submissions', JSON.stringify(submissions));
  }, [submissions]);
  useEffect(() => {
    localStorage.setItem('nd_discussions', JSON.stringify(discussions));
  }, [discussions]);
  useEffect(() => {
    localStorage.setItem('nd_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);
  useEffect(() => {
    localStorage.setItem('nd_safenet_scenarios', JSON.stringify(safeNetScenarios));
  }, [safeNetScenarios]);
  useEffect(() => {
    localStorage.setItem('nd_safenet_attempts', JSON.stringify(safeNetAttempts));
  }, [safeNetAttempts]);
  useEffect(() => {
    localStorage.setItem('nd_safenet_challenges', JSON.stringify(safeNetChallenges));
  }, [safeNetChallenges]);

  // Logging function
  const logAction = (action: string, target: string, details: string) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleString('vi-VN'),
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      target,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('nd_is_authenticated') === 'true';
  });

  // Auth & Role Switcher
  const loginUser = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('nd_is_authenticated', 'true');
    localStorage.setItem('nd_current_user', JSON.stringify(user));
    logAction('LOGIN', user.name, `Đăng nhập vai trò ${user.role}`);
    if (user.role === 'TEACHER') {
      setActiveView('teacher_dashboard');
    } else if (user.role === 'ADMIN') {
      setActiveView('admin_dashboard');
    } else {
      setActiveView('student_dashboard');
    }
  };

  const loginWithCredentials = async (
    username: string,
    pass: string
  ): Promise<{ success: boolean; message: string; user?: User }> => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanUsername || !cleanPass) {
      return { success: false, message: 'Vui lòng nhập đầy đủ tên tài khoản và mật khẩu.' };
    }

    // 1. Check local users
    let matchedUser = users.find(
      (u) =>
        (u.username && u.username.toLowerCase() === cleanUsername) ||
        (u.email && u.email.toLowerCase().startsWith(cleanUsername))
    );

    if (matchedUser) {
      if (matchedUser.password && matchedUser.password !== cleanPass) {
        return { success: false, message: 'Mật khẩu không chính xác. Vui lòng kiểm tra lại.' };
      }
    } else {
      // 2. Query Supabase profiles if available
      try {
        const supabase = getSupabaseClient();
        if (supabase) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .or(`username.eq.${cleanUsername},email.ilike.${cleanUsername}%`)
            .maybeSingle();

          if (data && !error) {
            matchedUser = {
              id: data.id,
              name: data.name,
              email: data.email,
              username: data.username || cleanUsername,
              password: cleanPass,
              role: (data.role as Role) || 'STUDENT',
              avatar:
                data.avatar ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
              school: data.school || 'Trường THPT Nguyễn Dục',
              className: data.class_name || '12A1',
              classId: data.class_id || 'class_12a1',
              bio: data.bio || '',
              joinedDate: new Date().toISOString().slice(0, 10),
            };
            setUsers((prev) => [matchedUser!, ...prev]);
          }
        }
      } catch (err) {
        console.warn('Supabase profile query fallback error:', err);
      }
    }

    if (!matchedUser) {
      return {
        success: false,
        message: 'Tài khoản không tồn tại. Vui lòng chuyển sang tab Đăng ký để tạo tài khoản mới.',
      };
    }

    loginUser(matchedUser);
    return {
      success: true,
      message: `Đăng nhập thành công! Chào mừng ${matchedUser.name}.`,
      user: matchedUser,
    };
  };

  const registerWithCredentials = async (
    username: string,
    pass: string,
    role: Role = 'STUDENT',
    name?: string
  ): Promise<{ success: boolean; message: string; user?: User }> => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanUsername || !cleanPass) {
      return { success: false, message: 'Vui lòng nhập đầy đủ tên tài khoản và mật khẩu.' };
    }

    if (cleanPass.length < 3) {
      return { success: false, message: 'Mật khẩu phải có tối thiểu 3 ký tự.' };
    }

    const existing = users.find(
      (u) => u.username && u.username.toLowerCase() === cleanUsername
    );
    if (existing) {
      return {
        success: false,
        message: 'Tên tài khoản này đã được sử dụng. Vui lòng chọn tên khác hoặc chuyển sang Đăng nhập.',
      };
    }

    const displayName =
      name?.trim() ||
      (role === 'TEACHER'
        ? `Thầy/Cô ${username.trim()}`
        : role === 'ADMIN'
        ? `Quản trị ${username.trim()}`
        : `Học sinh ${username.trim()}`);

    const defaultAvatar =
      role === 'TEACHER'
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
        : role === 'ADMIN'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: displayName,
      username: cleanUsername,
      password: cleanPass,
      email: `${cleanUsername}@thptnguyenduc.edu.vn`,
      role,
      avatar: defaultAvatar,
      className: role === 'STUDENT' ? '12A1' : undefined,
      classId: role === 'STUDENT' ? 'class_12a1' : undefined,
      school: 'Trường THPT Nguyễn Dục',
      bio: role === 'TEACHER' ? 'Giáo viên Tin học' : 'Học sinh THPT Nguyễn Dục',
      joinedDate: new Date().toISOString().slice(0, 10),
    };

    setUsers((prev) => [newUser, ...prev]);
    loginUser(newUser);

    // Asynchronously try to sync to Supabase profiles
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.from('profiles').insert([
          {
            id: newUser.id,
            username: newUser.username,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            class_name: newUser.className,
            class_id: newUser.classId,
            school: newUser.school,
            bio: newUser.bio,
          },
        ]);
      }
    } catch (err) {
      console.warn('Could not sync user to Supabase:', err);
    }

    logAction('REGISTER', newUser.name, `Đăng ký tài khoản mới ${cleanUsername} (${role})`);

    return {
      success: true,
      message: `Đăng ký tài khoản thành công! Chào mừng ${newUser.name}.`,
      user: newUser,
    };
  };

  const logoutUser = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('nd_is_authenticated');
    logAction('LOGOUT', currentUser.name, 'Đăng xuất khỏi hệ thống');
    setActiveView('landing');
  };

  const switchRole = (role: Role) => {
    const found = users.find((u) => u.role === role);
    if (found) {
      loginUser(found);
    }
  };

  // Classes
  const addClass = (newClassData: Omit<ClassRoom, 'id' | 'studentCount' | 'announcements'>) => {
    const id = `class_${Date.now()}`;
    const newClass: ClassRoom = {
      ...newClassData,
      id,
      studentCount: 1,
      announcements: [
        {
          id: `ann_${Date.now()}`,
          title: `Chào mừng các em đến với lớp ${newClassData.name}`,
          content: 'Lớp học số tích hợp Trợ lý AI sẵn sàng hỗ trợ các em.',
          createdAt: new Date().toLocaleString('vi-VN'),
          authorName: currentUser.name,
        },
      ],
    };
    setClasses((prev) => [...prev, newClass]);
    logAction('CREATE_CLASS', newClass.name, `Tạo lớp học mã ${newClass.code}`);
    return newClass;
  };

  const joinClassByCode = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    const found = classes.find((c) => c.code.toUpperCase() === trimmed);
    if (!found) {
      return { success: false, message: 'Mã lớp không hợp lệ hoặc lớp không tồn tại.' };
    }
    // Update current user's class
    const updatedUser = { ...currentUser, classId: found.id, className: found.name };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    // Increase count
    setClasses((prev) =>
      prev.map((c) => (c.id === found.id ? { ...c, studentCount: c.studentCount + 1 } : c))
    );
    logAction('JOIN_CLASS', found.name, `Học sinh ${currentUser.name} tham gia lớp`);
    return { success: true, message: `Tham gia thành công lớp ${found.name} – ${found.subject}`, classItem: found };
  };

  // Assignments
  const createAssignment = (asgData: Partial<Assignment>) => {
    const newAsg: Assignment = {
      id: `asg_${Date.now()}`,
      title: asgData.title || 'Nhiệm vụ Tin học mới',
      classId: asgData.classId || classes[0].id,
      className: classes.find((c) => c.id === asgData.classId)?.name || '12A1',
      subject: asgData.subject || 'Tin học 12',
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      description: asgData.description || 'Yêu cầu thực hành',
      requirements: asgData.requirements || ['Thực hiện theo rubric'],
      rubric: asgData.rubric || [
        { id: 'r1', name: 'Chuẩn cú pháp', weight: 30, maxPoints: 3, description: 'Đúng chuẩn' },
        { id: 'r2', name: 'Yêu cầu chức năng', weight: 40, maxPoints: 4, description: 'Đạt yêu cầu' },
        { id: 'r3', name: 'Trình bày sáng tạo', weight: 30, maxPoints: 3, description: 'Bố cục đẹp' },
      ],
      maxScore: asgData.maxScore || 10,
      startDate: new Date().toISOString().slice(0, 16),
      dueDate: asgData.dueDate || '2024-10-30 23:59',
      status: 'published',
      allowedResubmissions: asgData.allowedResubmissions ?? 3,
      aiAssistantEnabled: asgData.aiAssistantEnabled ?? true,
      aiSupportLevel: asgData.aiSupportLevel || 'full',
      starterTemplate: asgData.starterTemplate || '<!-- Mã khởi tạo -->',
    };
    setAssignments((prev) => [newAsg, ...prev]);
    logAction('CREATE_ASSIGNMENT', newAsg.title, `Giao nhiệm vụ cho lớp ${newAsg.className}`);
    return newAsg;
  };

  // Submissions & 4C Versions
  const submitNewVersion = (
    assignmentId: string,
    htmlContent: string,
    notes?: string,
    aiFeedback?: AIFeedback4C
  ) => {
    const targetAsg = assignments.find((a) => a.id === assignmentId);
    let existingSub = submissions.find(
      (s) => s.assignmentId === assignmentId && s.studentId === currentUser.id
    );

    const nowStr = new Date().toLocaleString('vi-VN');

    if (!existingSub) {
      // First submission
      const newVersion: SubmissionVersion = {
        versionNumber: 1,
        submittedAt: nowStr,
        htmlContent,
        notes: notes || 'Phiên bản nộp lần 1',
        aiFeedback,
        resolvedIssuesCount: 0,
        unresolvedIssuesCount: aiFeedback?.issues.length || 0,
      };

      const newSubmission: Submission = {
        id: `sub_${currentUser.id}_${Date.now()}`,
        assignmentId,
        assignmentTitle: targetAsg?.title || 'Bài tập Tin học',
        studentId: currentUser.id,
        studentName: currentUser.name,
        studentCode: `HS${currentUser.name.slice(0, 2).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`,
        classId: currentUser.classId || 'class_12a1',
        className: currentUser.className || '12A1',
        status: 'submitted',
        currentVersion: 1,
        isConfirmedByTeacher: false,
        totalTimeMinutes: 25,
        versions: [newVersion],
      };

      setSubmissions((prev) => [newSubmission, ...prev]);
      logAction('SUBMIT_ASSIGNMENT', targetAsg?.title || '', `Học sinh nộp lần 1`);
      return { submission: newSubmission, versionNumber: 1 };
    } else {
      // Resubmission (e.g. Version 2, Version 3)
      const nextVersionNum = existingSub.versions.length + 1;
      const prevVersion = existingSub.versions[existingSub.versions.length - 1];
      const prevIssuesCount = prevVersion.aiFeedback?.issues.length || 0;
      const currentIssuesCount = aiFeedback?.issues.length || 0;
      const resolved = Math.max(0, prevIssuesCount - currentIssuesCount);

      const newVersion: SubmissionVersion = {
        versionNumber: nextVersionNum,
        submittedAt: nowStr,
        htmlContent,
        notes: notes || `Phiên bản nộp lần ${nextVersionNum} (Đã cải thiện)`,
        aiFeedback,
        resolvedIssuesCount: resolved,
        unresolvedIssuesCount: currentIssuesCount,
      };

      const updatedSub: Submission = {
        ...existingSub,
        currentVersion: nextVersionNum,
        status: 'submitted',
        totalTimeMinutes: existingSub.totalTimeMinutes + 20,
        versions: [...existingSub.versions, newVersion],
      };

      setSubmissions((prev) =>
        prev.map((s) => (s.id === existingSub!.id ? updatedSub : s))
      );
      logAction(
        'RESUBMIT_ASSIGNMENT',
        targetAsg?.title || '',
        `Học sinh nộp phiên bản ${nextVersionNum} (Đã cải thiện)`
      );
      return { submission: updatedSub, versionNumber: nextVersionNum };
    }
  };

  const submitAssignmentFiles = (payload: {
    assignmentId: string;
    files: SubmissionFile[];
    externalLinks?: ExternalLink[];
    notes?: string;
    isDraft?: boolean;
    htmlContent?: string;
  }) => {
    const targetAsg = assignments.find((a) => a.id === payload.assignmentId);
    const existingSub = submissions.find(
      (s) => s.assignmentId === payload.assignmentId && s.studentId === currentUser.id
    );

    const nowStr = new Date().toLocaleString('vi-VN');
    const status = payload.isDraft ? 'draft' : 'submitted';

    if (!existingSub) {
      const newVersion: SubmissionVersion = {
        versionNumber: 1,
        submittedAt: nowStr,
        htmlContent: payload.htmlContent || '',
        notes: payload.notes || (payload.isDraft ? 'Bản lưu nháp' : 'Phiên bản nộp lần 1'),
        attachedFiles: payload.files,
        externalLinks: payload.externalLinks || [],
        resolvedIssuesCount: 0,
        unresolvedIssuesCount: 0,
      };

      const newSubmission: Submission = {
        id: `sub_${currentUser.id}_${Date.now()}`,
        assignmentId: payload.assignmentId,
        assignmentTitle: targetAsg?.title || 'Bài tập Tin học',
        studentId: currentUser.id,
        studentName: currentUser.name,
        studentCode: `HS${currentUser.name.slice(0, 2).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`,
        classId: currentUser.classId || 'class_12a1',
        className: currentUser.className || '12A1',
        status,
        currentVersion: 1,
        attachedFiles: payload.files,
        externalLinks: payload.externalLinks || [],
        notes: payload.notes,
        isDraft: payload.isDraft,
        submittedAt: payload.isDraft ? undefined : nowStr,
        isConfirmedByTeacher: false,
        totalTimeMinutes: 20,
        versions: [newVersion],
      };

      setSubmissions((prev) => [newSubmission, ...prev]);

      if (!payload.isDraft) {
        setNotifications((prev) => [
          {
            id: `notif_${Date.now()}`,
            userId: currentUser.id,
            title: 'Nộp bài thành công',
            message: `Bài nộp "${targetAsg?.title || 'Bài tập'}" đã được gửi tới giáo viên lúc ${nowStr}.`,
            time: 'Vừa xong',
            read: false,
            type: 'assignment',
          },
          ...prev,
        ]);
      }

      logAction(
        payload.isDraft ? 'SAVE_DRAFT' : 'SUBMIT_ASSIGNMENT_FILES',
        targetAsg?.title || '',
        `Học sinh ${payload.isDraft ? 'lưu nháp' : 'nộp'} ${payload.files.length} tệp tin`
      );

      return { submission: newSubmission, isNewVersion: false };
    } else {
      const isNewVersion = !existingSub.isDraft && !payload.isDraft;
      const nextVersionNum = isNewVersion ? existingSub.versions.length + 1 : existingSub.currentVersion;

      const newVersion: SubmissionVersion = {
        versionNumber: nextVersionNum,
        submittedAt: nowStr,
        htmlContent: payload.htmlContent || existingSub.versions[existingSub.versions.length - 1]?.htmlContent || '',
        notes: payload.notes || (payload.isDraft ? 'Bản lưu nháp' : `Phiên bản nộp lần ${nextVersionNum}`),
        attachedFiles: payload.files,
        externalLinks: payload.externalLinks || [],
        resolvedIssuesCount: 0,
        unresolvedIssuesCount: 0,
      };

      const updatedSub: Submission = {
        ...existingSub,
        status,
        isDraft: payload.isDraft,
        submittedAt: payload.isDraft ? existingSub.submittedAt : nowStr,
        attachedFiles: payload.files,
        externalLinks: payload.externalLinks || [],
        notes: payload.notes,
        currentVersion: nextVersionNum,
        versions: isNewVersion
          ? [...existingSub.versions, newVersion]
          : existingSub.versions.map((v, i) => (i === existingSub.versions.length - 1 ? newVersion : v)),
      };

      setSubmissions((prev) => prev.map((s) => (s.id === existingSub!.id ? updatedSub : s)));

      if (!payload.isDraft) {
        setNotifications((prev) => [
          {
            id: `notif_${Date.now()}`,
            userId: currentUser.id,
            title: isNewVersion ? 'Nộp lại phiên bản mới thành công' : 'Nộp bài thành công',
            message: `Đã gửi phiên bản ${nextVersionNum} của "${targetAsg?.title || 'Bài tập'}" lúc ${nowStr}.`,
            time: 'Vừa xong',
            read: false,
            type: 'assignment',
          },
          ...prev,
        ]);
      }

      logAction(
        payload.isDraft ? 'SAVE_DRAFT' : 'SUBMIT_ASSIGNMENT_FILES',
        targetAsg?.title || '',
        `Cập nhật bài nộp phiên bản ${nextVersionNum} (${payload.files.length} tệp)`
      );

      return { submission: updatedSub, isNewVersion };
    }
  };

  const saveDiagnosticFeedback = (
    submissionId: string,
    versionNumber: number,
    feedback: AIFeedback4C
  ) => {
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id !== submissionId) return sub;
        const updatedVersions = sub.versions.map((ver) => {
          if (ver.versionNumber === versionNumber) {
            return {
              ...ver,
              aiFeedback: feedback,
              unresolvedIssuesCount: feedback.issues.length,
            };
          }
          return ver;
        });
        return { ...sub, versions: updatedVersions };
      })
    );
  };

  const teacherConfirmGrade = (submissionId: string, grade: number, comment: string) => {
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id !== submissionId) return s;
        return {
          ...s,
          teacherGrade: grade,
          teacherComment: comment,
          teacherReviewedAt: new Date().toLocaleString('vi-VN'),
          isConfirmedByTeacher: true,
          status: 'completed',
        };
      })
    );
    const target = submissions.find((s) => s.id === submissionId);
    logAction(
      'TEACHER_CONFIRM_GRADE',
      target?.studentName || '',
      `Giáo viên xác nhận điểm ${grade}/10: "${comment.slice(0, 40)}..."`
    );
    // Add notification to student
    if (target) {
      setNotifications((prev) => [
        {
          id: `notif_${Date.now()}`,
          userId: target.studentId,
          title: `Giáo viên đã xác nhận kết quả bài ${target.assignmentTitle}`,
          message: `Điểm: ${grade}/10. Lời nhận xét: "${comment}"`,
          time: 'Vừa xong',
          read: false,
          type: 'feedback',
        },
        ...prev,
      ]);
    }
  };

  // Discussions
  const addDiscussionPost = (title: string, content: string, category: any, tags: string[], classId: string) => {
    const classObj = classes.find((c) => c.id === classId);
    const newPost: DiscussionPost = {
      id: `disc_${Date.now()}`,
      classId,
      className: classObj?.name || '12A1',
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorAvatar: currentUser.avatar,
      title,
      content,
      category,
      tags,
      createdAt: new Date().toLocaleString('vi-VN'),
      likes: 1,
      comments: [],
    };
    setDiscussions((prev) => [newPost, ...prev]);
    logAction('FORUM_NEW_POST', title, `Đăng bài thảo luận lớp ${classObj?.name}`);
  };

  const addDiscussionComment = (postId: string, content: string) => {
    const newComment = {
      id: `comm_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toLocaleString('vi-VN'),
    };
    setDiscussions((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p))
    );
    logAction('FORUM_COMMENT', postId, `Bình luận thảo luận`);
  };

  const markCommentHelpful = (postId: string, commentId: string) => {
    setDiscussions((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const updated = p.comments.map((c) =>
          c.id === commentId ? { ...c, isHelpful: !c.isHelpful } : c
        );
        return { ...p, comments: updated, isSolved: true };
      })
    );
  };

  const toggleLikePost = (postId: string) => {
    setDiscussions((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  // Real CSV Export with UTF-8 BOM
  const exportSubmissionsCSV = (filterClassId?: string) => {
    const filtered = filterClassId
      ? submissions.filter((s) => s.classId === filterClassId)
      : submissions;

    const headers = [
      'Mã Học Sinh',
      'Họ và Tên',
      'Lớp',
      'Nhiệm Vụ',
      'Số Lần Nộp',
      'Trạng Thái',
      'Điểm Giáo Viên Xác Nhận',
      'Số Lỗi Đã Sửa (Model 4C)',
      'Thời Gian Thực Hiện (phút)',
      'Nhận Xét Của Giáo Viên',
    ];

    const rows = filtered.map((sub) => {
      const lastVer = sub.versions[sub.versions.length - 1];
      const errorsFixed = sub.versions.reduce(
        (acc, v) => acc + (v.resolvedIssuesCount || 0),
        0
      );
      return [
        `"${sub.studentCode}"`,
        `"${sub.studentName}"`,
        `"${sub.className}"`,
        `"${sub.assignmentTitle}"`,
        sub.versions.length,
        `"${sub.status === 'completed' ? 'Hoàn thành' : 'Đã nộp'}"`,
        sub.teacherGrade !== undefined ? sub.teacherGrade : 'Chưa chấm',
        errorsFixed,
        sub.totalTimeMinutes,
        `"${(sub.teacherComment || 'Chưa có').replace(/"/g, '""')}"`,
      ].join(',');
    });

    // UTF-8 BOM \uFEFF so Excel renders Vietnamese accents correctly
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `Bao_Cao_Tien_Bo_Hoc_Tap_THPT_Nguyen_Duc_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    logAction('EXPORT_CSV', 'Báo cáo học tập', `Xuất file CSV ${filtered.length} bản ghi`);
  };

  // SafeNet AI Actions
  const addSafeNetAttempt = (
    attemptData: Omit<SafeNetStudentAttempt, 'id' | 'completedAt'>
  ): SafeNetStudentAttempt => {
    const newAttempt: SafeNetStudentAttempt = {
      ...attemptData,
      id: `att_${Date.now()}`,
      completedAt: new Date().toLocaleString('vi-VN'),
    };
    setSafeNetAttempts((prev) => [newAttempt, ...prev]);

    // Send notification
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: attemptData.studentId,
      title: 'Hoàn thành thử thách SafeNet AI',
      message: `Em đã đạt ${newAttempt.totalScore}/100 điểm thử thách: "${newAttempt.scenarioTitle}". Đạt huy hiệu: ${newAttempt.earnedBadge || 'Công dân số'}`,
      time: 'Vừa xong',
      read: false,
      type: 'feedback',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    logAction(
      'SAFENET_ATTEMPT',
      newAttempt.scenarioTitle,
      `Học sinh ${newAttempt.studentName} hoàn thành với ${newAttempt.totalScore}đ`
    );

    return newAttempt;
  };

  const createSafeNetScenario = (scenarioData: Omit<SafeNetScenario, 'id'>): SafeNetScenario => {
    const newScenario: SafeNetScenario = {
      ...scenarioData,
      id: `scen_${Date.now()}`,
    };
    setSafeNetScenarios((prev) => [newScenario, ...prev]);
    logAction('CREATE_SCENARIO', newScenario.title, `Tạo tình huống mới (${newScenario.category})`);
    return newScenario;
  };

  const createSafeNetChallenge = (
    challengeData: Omit<SafeNetChallenge, 'id' | 'status'>
  ): SafeNetChallenge => {
    const newChallenge: SafeNetChallenge = {
      ...challengeData,
      id: `chal_${Date.now()}`,
      status: 'active',
    };
    setSafeNetChallenges((prev) => [newChallenge, ...prev]);
    logAction('ASSIGN_CHALLENGE', newChallenge.title, `Giao thử thách cho lớp ${newChallenge.className}`);
    return newChallenge;
  };

  const exportSafeNetCSV = (filterClassId?: string) => {
    let filtered = safeNetAttempts;
    if (filterClassId && filterClassId !== 'all') {
      const targetClass = classes.find((c) => c.id === filterClassId);
      if (targetClass) {
        filtered = safeNetAttempts.filter((a) => a.className === targetClass.name);
      }
    }

    const headers = [
      'STT',
      'Họ và tên Học sinh',
      'Lớp',
      'Tên Tình huống Giả lập',
      'Thể loại Nguy cơ',
      'Thời gian Hoàn thành',
      'Tổng điểm (/100)',
      'Nhận diện Nguy cơ',
      'Ứng phó An toàn',
      'Bảo vệ Dữ liệu',
      'Tư duy Phản biện',
      'Văn hóa Mạng',
      'Huy hiệu Đạt được',
      'Đánh giá Sư phạm AI',
    ];

    const rows = filtered.map((a, idx) => [
      idx + 1,
      `"${a.studentName}"`,
      `"${a.className}"`,
      `"${a.scenarioTitle}"`,
      `"${a.category}"`,
      `"${a.completedAt}"`,
      a.totalScore,
      a.competencies.threatIdentification,
      a.competencies.safeResponse,
      a.competencies.dataProtection,
      a.competencies.criticalThinking,
      a.competencies.digitalCulture,
      `"${a.earnedBadge || 'Chưa có'}"`,
      `"${(a.aiEvaluationSummary || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `Bao_Cao_SafeNet_AI_Lop_${filterClassId || 'Tat_Ca'}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    logAction('EXPORT_SAFENET_CSV', 'Báo cáo SafeNet AI', `Xuất file CSV ${filtered.length} bản ghi`);
  };

  const resetToInitialDemo = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[1]);
    setClasses(INITIAL_CLASSES);
    setAssignments(INITIAL_ASSIGNMENTS);
    setSubmissions(INITIAL_SUBMISSIONS);
    setDiscussions(INITIAL_DISCUSSIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSafeNetScenarios(INITIAL_SAFENET_SCENARIOS);
    setSafeNetAttempts(INITIAL_SAFENET_ATTEMPTS);
    setSafeNetChallenges(INITIAL_SAFENET_CHALLENGES);
    setActiveView('reviewer_4c');
    logAction('RESET_SYSTEM', 'Demo 4C', 'Khôi phục dữ liệu ban đầu cho kịch bản bài thi');
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        loginWithCredentials,
        registerWithCredentials,
        logoutUser,
        currentUser,
        users,
        classes,
        assignments,
        submissions,
        discussions,
        auditLogs,
        notifications,
        serverHealth,
        activeView,
        setActiveView,
        selectedAssignmentId,
        setSelectedAssignmentId,
        selectedSubmissionId,
        setSelectedSubmissionId,
        safeNetScenarios,
        safeNetAttempts,
        safeNetChallenges,
        selectedSafeNetScenarioId,
        setSelectedSafeNetScenarioId,
        addSafeNetAttempt,
        createSafeNetScenario,
        createSafeNetChallenge,
        exportSafeNetCSV,
        loginUser,
        switchRole,
        addClass,
        joinClassByCode,
        createAssignment,
        submitNewVersion,
        submitAssignmentFiles,
        saveDiagnosticFeedback,
        teacherConfirmGrade,
        addDiscussionPost,
        addDiscussionComment,
        markCommentHelpful,
        toggleLikePost,
        exportSubmissionsCSV,
        resetToInitialDemo,
        logAction,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
