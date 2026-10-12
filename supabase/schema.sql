-- =========================================================================
-- NGUYỄN DỤC AI LEARNING HUB - TỆP SQL ĐẦY ĐỦ VÀ HOÀN CHỈNH CHO SUPABASE
-- Bao gồm: Toàn bộ bảng, Tài khoản, Lớp học, Bài tập, Storage và Dữ liệu mẫu
-- Chạy 1 lần duy nhất trong SQL Editor là hoàn tất 100%!
-- =========================================================================

-- 1. KÍCH HOẠT EXTENSION UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. BẢNG TÀI KHOẢN NGƯỜI DÙNG (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('STUDENT', 'TEACHER', 'ADMIN')),
  avatar TEXT,
  class_id TEXT,
  class_name TEXT,
  student_code TEXT,
  school TEXT DEFAULT 'THPT Nguyễn Dục',
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BẢNG LỚP HỌC (Classes)
CREATE TABLE IF NOT EXISTS public.classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  grade TEXT NOT NULL DEFAULT '12',
  academic_year TEXT NOT NULL DEFAULT '2024 - 2025',
  teacher_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  teacher_name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL DEFAULT 'Tin học',
  student_count INTEGER DEFAULT 0,
  description TEXT,
  color TEXT DEFAULT 'blue',
  announcements JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BẢNG BÀI TẬP / NHIỆM VỤ (Assignments)
CREATE TABLE IF NOT EXISTS public.assignments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT 'Tin học 12',
  class_id TEXT NOT NULL,
  class_name TEXT NOT NULL,
  teacher_id TEXT NOT NULL,
  teacher_name TEXT NOT NULL DEFAULT 'Cô Trần Thị Tuyết Nhung',
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  rubric JSONB DEFAULT '[]'::jsonb,
  max_score NUMERIC(4,2) DEFAULT 10.0,
  max_file_size_mb INTEGER DEFAULT 20,
  allowed_extensions TEXT[] DEFAULT ARRAY['pdf', 'docx', 'pptx', 'xlsx', 'jpg', 'png', 'html', 'css', 'js', 'py', 'zip'],
  allowed_resubmissions INTEGER DEFAULT 3,
  ai_assistant_enabled BOOLEAN DEFAULT true,
  ai_support_level TEXT DEFAULT 'full',
  due_date TEXT NOT NULL,
  status TEXT DEFAULT 'published',
  starter_template TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BẢNG BÀI NỘP CỦA HỌC SINH (Submissions)
CREATE TABLE IF NOT EXISTS public.submissions (
  id TEXT PRIMARY KEY,
  assignment_id TEXT REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_code TEXT,
  class_id TEXT NOT NULL,
  class_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('not_started', 'in_progress', 'draft', 'submitted', 'needs_revision', 'completed')),
  current_version INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  external_links JSONB DEFAULT '[]'::jsonb,
  attached_files JSONB DEFAULT '[]'::jsonb,
  versions JSONB DEFAULT '[]'::jsonb,
  teacher_grade NUMERIC(4, 2),
  teacher_comment TEXT,
  teacher_reviewed_at TEXT,
  submitted_at TEXT,
  total_time_minutes INTEGER DEFAULT 45,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BẢNG DIỄN ĐÀN THẢO LUẬN (Discussions)
CREATE TABLE IF NOT EXISTS public.discussions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  class_id TEXT,
  likes INTEGER DEFAULT 0,
  comments JSONB DEFAULT '[]'::jsonb,
  created_at TEXT NOT NULL
);

-- 7. BẢNG SAFENET AI (Kịch bản & Lượt làm bài Đạo đức AI)
CREATE TABLE IF NOT EXISTS public.safenet_scenarios (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  dilemma TEXT NOT NULL,
  framework_focus TEXT NOT NULL,
  options JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.safenet_attempts (
  id TEXT PRIMARY KEY,
  scenario_id TEXT REFERENCES public.safenet_scenarios(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  class_id TEXT NOT NULL,
  class_name TEXT NOT NULL,
  selected_option_id TEXT NOT NULL,
  student_reflection TEXT,
  earned_score INTEGER NOT NULL,
  ai_evaluation JSONB,
  completed_at TEXT NOT NULL
);

-- 8. BẢNG NHẬT KÝ HỆ THỐNG (Audit Logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  role TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  details TEXT NOT NULL
);

-- =========================================================================
-- BẬT ROW LEVEL SECURITY (RLS) VÀ CẤP QUYỀN
-- =========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safenet_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safenet_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Xóa chính sách cũ nếu tồn tại để tránh lỗi trùng lặp khi chạy lại
DROP POLICY IF EXISTS "policy_profiles_all" ON public.profiles;
DROP POLICY IF EXISTS "policy_classes_all" ON public.classes;
DROP POLICY IF EXISTS "policy_assignments_all" ON public.assignments;
DROP POLICY IF EXISTS "policy_submissions_all" ON public.submissions;
DROP POLICY IF EXISTS "policy_discussions_all" ON public.discussions;
DROP POLICY IF EXISTS "policy_safenet_scenarios_all" ON public.safenet_scenarios;
DROP POLICY IF EXISTS "policy_safenet_attempts_all" ON public.safenet_attempts;
DROP POLICY IF EXISTS "policy_audit_logs_all" ON public.audit_logs;

-- Tạo chính sách cho phép truy cập đầy đủ
CREATE POLICY "policy_profiles_all" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "policy_classes_all" ON public.classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "policy_assignments_all" ON public.assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "policy_submissions_all" ON public.submissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "policy_discussions_all" ON public.discussions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "policy_safenet_scenarios_all" ON public.safenet_scenarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "policy_safenet_attempts_all" ON public.safenet_attempts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "policy_audit_logs_all" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

-- =========================================================================
-- KHỞI TẠO STORAGE BUCKET 'submission-files'
-- =========================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('submission-files', 'submission-files', true, 26214400) -- 25MB
ON CONFLICT (id) DO UPDATE SET public = true;

-- Cấp quyền RLS cho storage.objects để học sinh nộp bài và tải tệp
DROP POLICY IF EXISTS "policy_storage_objects_select" ON storage.objects;
DROP POLICY IF EXISTS "policy_storage_objects_insert" ON storage.objects;
DROP POLICY IF EXISTS "policy_storage_objects_update" ON storage.objects;
DROP POLICY IF EXISTS "policy_storage_objects_delete" ON storage.objects;

CREATE POLICY "policy_storage_objects_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'submission-files');

CREATE POLICY "policy_storage_objects_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'submission-files');

CREATE POLICY "policy_storage_objects_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'submission-files');

CREATE POLICY "policy_storage_objects_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'submission-files');

-- =========================================================================
-- DỮ LIỆU BAN ĐẦU (SEED DATA MẪU)
-- =========================================================================

-- 1. Nạp Tài khoản mẫu (Cô Nhung, Học sinh An, Admin Đạo, ...)
INSERT INTO public.profiles (id, username, name, email, role, class_id, class_name, student_code, bio)
VALUES 
  ('user_teacher_1', 'nhung.ttt', 'Cô Trần Thị Tuyết Nhung', 'nhung.ttt@thptnguyenduc.edu.vn', 'TEACHER', 'class_12a1', '12A1', 'GV-TIN-01', 'Giáo viên Tin học • THPT Nguyễn Dục'),
  ('user_student_1', 'an.nv', 'Nguyễn Văn An', 'an.nv@thptnguyenduc.edu.vn', 'STUDENT', 'class_12a1', '12A1', 'HS12-001', 'Học sinh lớp 12A1'),
  ('user_student_2', 'linh.tt', 'Trần Thùy Linh', 'linh.tt@thptnguyenduc.edu.vn', 'STUDENT', 'class_12a1', '12A1', 'HS12-002', 'Học sinh lớp 12A1'),
  ('user_student_3', 'minh.lq', 'Lê Quang Minh', 'minh.lq@thptnguyenduc.edu.vn', 'STUDENT', 'class_12a1', '12A1', 'HS12-003', 'Học sinh lớp 12A1'),
  ('user_admin_1', 'admin', 'Thầy Lê Quang Đạo', 'admin@thptnguyenduc.edu.vn', 'ADMIN', NULL, 'Ban Giám hiệu', 'BGH-01', 'Quản trị viên Hệ thống')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  class_name = EXCLUDED.class_name;

-- 2. Nạp Lớp học mẫu
INSERT INTO public.classes (id, name, grade, academic_year, teacher_id, teacher_name, code, subject, student_count, description)
VALUES 
  ('class_12a1', 'Lớp 12A1', '12', '2024 - 2025', 'user_teacher_1', 'Cô Trần Thị Tuyết Nhung', 'ND-12A1-TH', 'Tin học 12', 38, 'Lớp chuyên cần Tin học Định hướng Khoa học máy tính'),
  ('class_11a3', 'Lớp 11A3', '11', '2024 - 2025', 'user_teacher_1', 'Cô Trần Thị Tuyết Nhung', 'ND-11A3-TH', 'Tin học 11', 40, 'Lớp thực hành Lập trình Python cơ bản')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code = EXCLUDED.code;

-- 3. Nạp Bài tập mẫu
INSERT INTO public.assignments (id, title, subject, class_id, class_name, teacher_id, teacher_name, description, due_date, status, requirements)
VALUES 
  ('asg_12_01', 'Tin học 12 – Bài 9: Tạo danh sách, bảng và liên kết trang web', 'Tin học 12', 'class_12a1', '12A1', 'user_teacher_1', 'Cô Trần Thị Tuyết Nhung', 'Xây dựng trang web giới thiệu trường THPT Nguyễn Dục ứng dụng danh sách và bảng', '2024-10-30 23:59', 'published', ARRAY['Sử dụng thẻ <ul> hoặc <ol>', 'Sử dụng thẻ <table> chuẩn', 'Tối thiểu 1 liên kết <a>']),
  ('asg_12_02', 'Tin học 12 – Dự án CSS Grid: Thiết kế giao diện báo tường điện tử', 'Tin học 12', 'class_12a1', '12A1', 'user_teacher_1', 'Cô Trần Thị Tuyết Nhung', 'Sử dụng CSS Grid bố cục trang báo tường kỷ niệm 20-11', '2024-11-15 23:59', 'published', ARRAY['Dùng CSS Grid responsive', 'Phối màu hài hòa'])
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title;
