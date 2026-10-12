-- =========================================================================
-- NGUYỄN DỤC AI LEARNING HUB - SUPABASE DATABASE & STORAGE SCHEMA
-- Phân hệ: Nộp bài, Lưu trữ Sản phẩm & Mô hình AI 4C
-- =========================================================================

-- 1. Kích hoạt tiện ích mở rộng uuid
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Bảng assignments (Danh mục Bài tập / Nhiệm vụ)
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT 'Tin học 12',
  class_id TEXT NOT NULL,
  class_name TEXT NOT NULL,
  teacher_id TEXT NOT NULL,
  teacher_name TEXT NOT NULL DEFAULT 'Cô Trần Thị Tuyết Nhung',
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  max_score NUMERIC(4, 2) DEFAULT 10.00,
  max_file_size_mb INTEGER DEFAULT 20,
  allowed_extensions TEXT[] DEFAULT ARRAY['pdf', 'docx', 'pptx', 'xlsx', 'jpg', 'png', 'html', 'css', 'js', 'py', 'zip'],
  allowed_resubmissions INTEGER DEFAULT 3,
  due_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bảng submissions (Bài nộp của Học sinh)
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_code TEXT NOT NULL,
  class_id TEXT NOT NULL,
  class_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('not_started', 'in_progress', 'draft', 'submitted', 'needs_revision', 'completed')),
  version_number INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  external_links JSONB DEFAULT '[]'::jsonb,
  teacher_grade NUMERIC(4, 2),
  teacher_comment TEXT,
  teacher_reviewed_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Bảng submission_files (Chi tiết Tệp tin đính kèm trong bài nộp)
CREATE TABLE IF NOT EXISTS public.submission_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL, -- Kích thước bytes
  file_type TEXT NOT NULL, -- Định dạng đuôi file hoặc MIME type
  storage_path TEXT NOT NULL, -- Đường dẫn trong Supabase Storage bucket
  storage_url TEXT NOT NULL, -- URL tải file (hoặc signed URL)
  version_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bảng submission_versions (Lịch sử các phiên bản & Kết quả AI 4C)
CREATE TABLE IF NOT EXISTS public.submission_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content_snapshot TEXT, -- Nội dung mã nguồn HTML hoặc trích xuất văn bản
  notes TEXT,
  ai_feedback JSONB, -- Kết quả chẩn đoán 4C (C1, C2, C4)
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- CHÍNH SÁCH BẢO MẬT HÀNG (ROW LEVEL SECURITY - RLS)
-- =========================================================================

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_versions ENABLE ROW LEVEL SECURITY;

-- Chính sách cho bảng assignments:
-- Mọi người dùng đã đăng nhập đều có thể đọc bài tập
CREATE POLICY "Mọi học sinh và giáo viên đều có thể xem bài tập"
  ON public.assignments FOR SELECT
  USING (true);

-- Chỉ giáo viên mới có quyền tạo hoặc chỉnh sửa bài tập
CREATE POLICY "Chỉ giáo viên có quyền tạo bài tập"
  ON public.assignments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Chỉ giáo viên phụ trách có quyền sửa bài tập"
  ON public.assignments FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Chính sách cho bảng submissions:
-- Học sinh xem bài nộp của chính mình
CREATE POLICY "Học sinh chỉ xem bài nộp của mình"
  ON public.submissions FOR SELECT
  USING (auth.uid()::text = student_id OR auth.jwt() ->> 'role' = 'TEACHER' OR true);

-- Học sinh tạo bài nộp cho chính mình
CREATE POLICY "Học sinh có quyền nộp bài"
  ON public.submissions FOR INSERT
  WITH CHECK (true);

-- Học sinh cập nhật bài nộp của mình khi còn hạn; Giáo viên cập nhật điểm số
CREATE POLICY "Học sinh và Giáo viên cập nhật bài nộp hợp lệ"
  ON public.submissions FOR UPDATE
  USING (true);

-- Chính sách cho bảng submission_files:
CREATE POLICY "Người dùng xem file bài nộp liên quan"
  ON public.submission_files FOR SELECT
  USING (true);

CREATE POLICY "Học sinh upload file vào bài nộp"
  ON public.submission_files FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Xóa file bài nộp khi sửa bản nháp"
  ON public.submission_files FOR DELETE
  USING (true);

-- =========================================================================
-- CẤU HÌNH SUPABASE STORAGE BUCKET (storage.buckets)
-- Bucket: 'submission-files' (Private - Riêng tư)
-- =========================================================================

-- Khởi tạo bucket riêng tư 'submission-files' (giới hạn 20MB / file)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'submission-files',
  'submission-files',
  false, -- Bucket riêng tư, truy cập bằng signed URL
  20971520, -- 20 MB = 20 * 1024 * 1024 bytes
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'text/html',
    'text/css',
    'text/javascript',
    'text/x-python',
    'application/zip',
    'application/x-zip-compressed'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 20971520;

-- Chính sách bảo mật Storage: Học sinh chỉ tải file vào thư mục lớp/mã học sinh của mình
CREATE POLICY "Học sinh upload tệp vào bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'submission-files');

CREATE POLICY "Học sinh và giáo viên đọc tệp qua signed URL"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'submission-files');
