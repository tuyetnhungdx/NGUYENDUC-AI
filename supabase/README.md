# HƯỚNG DẪN TRIỂN KHAI SUPABASE CHO NGUYỄN DỤC AI LEARNING HUB

Tài liệu này cung cấp hướng dẫn đầy đủ để kết nối cơ sở dữ liệu và lưu trữ đám mây Supabase cho phân hệ:
**“HỌC SINH UPLOAD VÀ NỘP BÀI TẬP & MÔ HÌNH AI 4C”**.

---

## 1. KHỞI TẠO DỰ ÁN SUPABASE

1. Truy cập [https://supabase.com](https://supabase.com) và đăng nhập bằng tài khoản GitHub hoặc Google.
2. Bấm **“New Project”**, đặt tên dự án: `nguyen-duc-ai-learning-hub`.
3. Chọn khu vực (Region): `Southeast Asia (Singapore)` để có tốc độ truy xuất tối ưu nhất cho học sinh Việt Nam.
4. Đặt mật khẩu cơ sở dữ liệu mạnh và hoàn tất khởi tạo.

---

## 2. CHẠY MÃ KHỞI TẠO CƠ SỞ DỮ LIỆU & RLS (SQL EDITOR)

1. Mở mục **SQL Editor** trên thanh điều hướng bên trái của Supabase Dashboard.
2. Bấm **“New query”**, sao chép toàn bộ nội dung từ tệp `supabase/schema.sql` vào khung soạn thảo.
3. Nhấn **“Run”** (hoặc tổ hợp phím `Ctrl + Enter` / `Cmd + Enter`).
4. Kết quả sẽ tạo lập thành công:
   - Bảng `public.assignments`: Lưu trữ danh mục bài tập, môn học, hạn nộp, giới hạn dung lượng và đuôi tệp cho phép.
   - Bảng `public.submissions`: Lưu thông tin học sinh nộp bài, thời gian nộp, trạng thái, điểm số và nhận xét của giáo viên.
   - Bảng `public.submission_files`: Lưu thông tin từng file đính kèm, đường dẫn storage và dung lượng.
   - Bảng `public.submission_versions`: Lưu lịch sử các lần nộp lại và kết quả phân tích AI 4C.
   - Các chính sách bảo mật Row Level Security (RLS) cho học sinh và giáo viên.

---

## 3. CẤU HÌNH SUPABASE STORAGE BUCKET

1. Vào mục **Storage** trên thanh menu Supabase.
2. Nếu chưa thấy bucket `submission-files`, nhấn **“New bucket”**:
   - Tên Bucket: `submission-files`
   - Public bucket: **OFF** (Để chế độ Riêng tư để bảo mật sản phẩm của học sinh).
   - Maximum file size: `20 MB` (hoặc `25 MB`).
   - Allowed MIME types: PDF, Word, Excel, PowerPoint, JPG, PNG, HTML, CSS, JS, Python, ZIP.
3. Hệ thống ứng dụng sử dụng **Signed URL** (thời hạn 24h) để giáo viên và học sinh tải file an toàn mà không để lộ bucket ra công cộng.

---

## 4. CẤU HÌNH BIẾN MÔI TRƯỜNG TRÊN ỨNG DỤNG

Lấy thông tin tại **Project Settings** -> **API**:
- **Project URL**: dạng `https://[project-ref].supabase.co`
- **Project API Anon Key**: dạng `eyJhbGciOiJIUzI1Ni...`

Điền vào tệp `.env` của ứng dụng:
```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

*Lưu ý:* Nếu chưa cấu hình biến môi trường, hệ thống có sẵn cơ chế **Lưu trữ Server Kép** tự động lưu tệp vào `/uploads` trên máy chủ và hỗ trợ modal cấu hình trực tiếp trong giao diện ứng dụng để đảm bảo tính năng nộp bài luôn hoạt động trơn tru 100%!
