import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  BookOpen,
  Bot,
  FileCheck2,
  Users,
  TrendingUp,
  BarChart2,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Code,
  Laptop,
  HelpCircle,
  Award,
  Layers,
  ChevronRight,
  PlayCircle,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActiveView, currentUser } = useApp();

  const features = [
    {
      icon: Laptop,
      title: '1. Lớp học số thông minh',
      description: 'Quản lý lớp học trực tuyến, cấp mã tham gia, phân phối tài liệu bài giảng và thông báo tức thì cho học sinh.',
      action: currentUser.role === 'TEACHER' ? 'teacher_dashboard' : 'student_dashboard',
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      icon: Bot,
      title: '2. Trợ lý học tập AI',
      description: 'Gia sư ảo hướng dẫn học sinh theo phương pháp gợi mở Socratic. Giải thích kiến thức Tin học 11, 12 mà không làm hộ.',
      action: 'tutor_chat',
      color: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    },
    {
      icon: FileCheck2,
      title: '3. Nộp bài & Phản hồi AI 4C',
      description: 'Trọng tâm sản phẩm: Chẩn đoán lỗi cú pháp HTML, chỉ dẫn 3 mức độ sư phạm và so sánh chứng minh tiến bộ giữa các phiên bản.',
      action: 'reviewer_4c',
      badge: 'Điểm nhấn',
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      icon: Users,
      title: '4. Diễn đàn thảo luận lớp',
      description: 'Không gian hỏi đáp sôi nổi với AI hỗ trợ diễn đạt câu hỏi rõ ràng, tóm tắt bài giảng và đánh dấu câu trả lời hữu ích.',
      action: 'discussions',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      icon: TrendingUp,
      title: '5. Theo dõi tiến bộ học tập',
      description: 'Ghi nhận toàn bộ lịch sử cải thiện mã nguồn của từng học sinh, giúp giáo viên đánh giá đúng thực chất năng lực tự học.',
      action: 'analytics',
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
      icon: BarChart2,
      title: '6. Thống kê & Đánh giá thông minh',
      description: 'Báo cáo trực quan tỷ lệ sửa lỗi, nhóm lỗi phổ biến của lớp và xuất báo cáo CSV chuẩn xác phục vụ quản lý chuyên môn.',
      action: 'analytics',
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-b from-blue-900 via-blue-800 to-indigo-900 text-white pt-12 pb-20">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-700/60 border border-blue-400/30 text-blue-200 text-xs font-semibold backdrop-blur-xs">
                <Laptop className="w-4 h-4 text-cyan-300" />
                <span>Nền tảng Lớp học số THPT Nguyễn Dục</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                NGUYỄN DỤC <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-300 via-blue-200 to-amber-200">
                  AI LEARNING HUB
                </span>
              </h1>

              <div className="inline-block bg-blue-950/70 border border-blue-400/40 px-4 py-2 rounded-xl text-amber-300 text-sm font-semibold">
                "Học tập thông minh – Sáng tạo không giới hạn"
              </div>

              <p className="text-base sm:text-lg text-blue-100/90 leading-relaxed max-w-2xl">
                Nền tảng lớp học số thông minh, cá nhân hóa học tập và hỗ trợ đánh giá quá trình bằng trí tuệ nhân tạo. 
                Giúp giáo viên tổ chức lớp học, học sinh thực hành và được AI đồng hành cải thiện bài làm theo mô hình 4C.
              </p>

              <div className="p-3.5 bg-blue-950/50 rounded-xl border border-blue-500/30 text-xs text-blue-200 flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span>
                  <strong>Thông điệp AI cốt lõi:</strong> "AI không làm thay – AI giúp học sinh tự làm tốt hơn."
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <button
                  onClick={() => setActiveView('reviewer_4c')}
                  className="px-6 py-3.5 rounded-xl bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-blue-950 font-bold text-sm shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Trải nghiệm AI 4C (Demo Bài 9)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveView('safenet_ai')}
                  className="px-5 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-lg shadow-teal-700/20 border border-teal-400/40 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-200" />
                  <span>SafeNet AI – Lá chắn số</span>
                </button>

                <button
                  onClick={() => setActiveView(currentUser.role === 'TEACHER' ? 'teacher_dashboard' : 'student_dashboard')}
                  className="px-5 py-3.5 rounded-xl bg-blue-800/80 hover:bg-blue-700/80 text-white font-semibold text-sm border border-blue-400/40 backdrop-blur-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-cyan-300" />
                  <span>Vào không gian học tập</span>
                </button>
              </div>
            </div>

            {/* Right Interactive Mockup Showcase */}
            <div className="lg:col-span-5">
              <div className="bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl">
                <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
                  {/* Window Bar */}
                  <div className="bg-slate-800 px-4 py-2.5 flex items-center justify-between border-b border-slate-700">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      AI-Reviewer-4C • THPT Nguyễn Dục
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">
                      Live Test
                    </span>
                  </div>

                  {/* Window Content */}
                  <div className="p-4 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between text-slate-300 pb-2 border-b border-slate-800">
                      <span className="font-bold text-amber-400">Tin học 12 – Bài 9: HTML Table & List</span>
                      <span className="text-[11px] text-slate-400">HS: Trần Thị Mai Anh (12A1)</span>
                    </div>

                    <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-1.5 text-[11px]">
                      <div className="text-cyan-400 flex items-center gap-2">
                        <span className="text-amber-400 font-bold">[C1 Chẩn đoán]:</span>
                        <span>Phát hiện 2 lỗi cú pháp thẻ &lt;table&gt; và &lt;ol&gt;</span>
                      </div>
                      <div className="text-emerald-400 flex items-center gap-2">
                        <span className="text-purple-400 font-bold">[C2 Chỉ dẫn]:</span>
                        <span>Cung cấp 3 mức gợi ý sư phạm (không cho chép mã)</span>
                      </div>
                      <div className="text-blue-300 flex items-center gap-2">
                        <span className="text-blue-400 font-bold">[C3 Chỉnh sửa]:</span>
                        <span>Học sinh tự sửa và nộp Version 2</span>
                      </div>
                      <div className="text-amber-300 flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">[C4 Tiến bộ]:</span>
                        <span>Điểm nâng từ 6.0 → 9.5 (Giáo viên phê duyệt)</span>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-950/40 rounded-lg border border-blue-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-slate-200 text-xs">Đã kiểm chứng luồng hoạt động thật</span>
                      </div>
                      <button
                        onClick={() => setActiveView('reviewer_4c')}
                        className="text-[11px] bg-blue-600 hover:bg-blue-500 text-white font-bold px-2.5 py-1 rounded transition-colors"
                      >
                        Chạy thử ngay →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHT: MÔ HÌNH AI 4C SECTION (The Core Innovation) */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="bg-blue-100 text-blue-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Trọng tâm sáng tạo sư phạm
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
              MÔ HÌNH AI 4C: ĐÁNH GIÁ VÀ HỖ TRỢ QUÁ TRÌNH
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Giải quyết bài toán cốt lõi trong giáo dục: Thay vì để AI làm bài hộ, mô hình 4C dẫn dắt học sinh tự tư duy, phát hiện lỗi và chứng minh sự tiến bộ thực chất.
            </p>
          </div>

          {/* 4 Steps Visual Flow */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Step 1: Chẩn đoán */}
            <div className="bg-slate-50 border-2 border-blue-200 rounded-2xl p-6 relative flex flex-col justify-between hover:shadow-lg transition-all group">
              <div className="absolute -top-3.5 left-6 bg-blue-600 text-white text-xs font-black px-3 py-0.5 rounded-full shadow-xs">
                C1 • BƯỚC 1
              </div>
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-105 transition-transform">
                  🩺
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 mb-2">CHẨN ĐOÁN</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  AI và hệ thống kiểm tra cấu trúc mã nguồn đối chiếu với <strong>Rubric đánh giá</strong> của giáo viên để phát hiện lỗi có thể kiểm chứng.
                </p>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-700 space-y-1">
                  <div className="text-emerald-700 font-semibold">✓ Chỉ rõ phần đã đạt</div>
                  <div className="text-amber-700 font-semibold">⚠ Chỉ rõ phần cần cải thiện</div>
                  <div className="text-slate-500">📍 Định vị dòng mã & mức ưu tiên</div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-blue-600 font-semibold">
                Khách quan • Dựa trên tiêu chí
              </div>
            </div>

            {/* Step 2: Chỉ dẫn */}
            <div className="bg-slate-50 border-2 border-cyan-200 rounded-2xl p-6 relative flex flex-col justify-between hover:shadow-lg transition-all group">
              <div className="absolute -top-3.5 left-6 bg-cyan-600 text-white text-xs font-black px-3 py-0.5 rounded-full shadow-xs">
                C2 • BƯỚC 2
              </div>
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-105 transition-transform">
                  🧭
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 mb-2">CHỈ DẪN</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  AI cung cấp gợi ý theo <strong>3 mức độ sư phạm</strong>, kích hoạt tư duy phản biện thay vì đưa ra đáp án mã nguồn trực tiếp.
                </p>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-700 space-y-1">
                  <div><strong>Mức 1:</strong> Nhận diện vị trí lỗi</div>
                  <div><strong>Mức 2:</strong> Gợi ý kiến thức & thẻ HTML</div>
                  <div><strong>Mức 3:</strong> Đặt câu hỏi tự nghiệm sâu</div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-cyan-600 font-semibold">
                Sư phạm Socratic • Không giải hộ
              </div>
            </div>

            {/* Step 3: Chỉnh sửa */}
            <div className="bg-slate-50 border-2 border-indigo-200 rounded-2xl p-6 relative flex flex-col justify-between hover:shadow-lg transition-all group">
              <div className="absolute -top-3.5 left-6 bg-indigo-600 text-white text-xs font-black px-3 py-0.5 rounded-full shadow-xs">
                C3 • BƯỚC 3
              </div>
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-105 transition-transform">
                  ✍️
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 mb-2">CHỈNH SỬA</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Học sinh trực tiếp sửa mã trong trình soạn thảo tích hợp, quan sát kết quả thời gian thực trong <strong>Sandbox an toàn</strong> và nộp phiên bản mới.
                </p>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-700 space-y-1">
                  <div>• Trình soạn thảo đánh dấu cú pháp</div>
                  <div>• Khung xem trước cô lập Sandbox</div>
                  <div>• Lưu trữ theo từng phiên bản Version</div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-indigo-600 font-semibold">
                Chủ động • Trải nghiệm thực tế
              </div>
            </div>

            {/* Step 4: Chứng minh tiến bộ */}
            <div className="bg-slate-50 border-2 border-emerald-200 rounded-2xl p-6 relative flex flex-col justify-between hover:shadow-lg transition-all group">
              <div className="absolute -top-3.5 left-6 bg-emerald-600 text-white text-xs font-black px-3 py-0.5 rounded-full shadow-xs">
                C4 • BƯỚC 4
              </div>
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-105 transition-transform">
                  📈
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 mb-2">CHỨNG MINH TIẾN BỘ</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Hệ thống đối chiếu <strong>Lần 1 vs Lần 2</strong>: chỉ rõ các dòng mã đã sửa, lỗi đã khắc phục và kết quả rubric. <strong>Giáo viên phê duyệt cuối cùng</strong>.
                </p>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-700 space-y-1">
                  <div>• So sánh sai khác mã nguồn (Diff)</div>
                  <div>• Thống kê số lỗi sửa thành công</div>
                  <div>• Giáo viên chấm & gửi nhận xét</div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-emerald-600 font-semibold">
                Minh chứng rõ ràng • GV xác nhận
              </div>
            </div>
          </div>

          {/* Quick Demo CTA */}
          <div className="mt-10 bg-linear-to-r from-blue-50 via-indigo-50 to-cyan-50 border border-blue-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                💡
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Tình huống thực nghiệm mẫu: Tin học 12 – Bài 9 (Tạo danh sách & bảng)
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Đã chuẩn bị sẵn bài tập mẫu có lỗi cố ý để quý Ban giám khảo kiểm thử trực tiếp trọn vẹn chuỗi 4C.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveView('reviewer_4c')}
              className="shrink-0 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Vào xem bài thực nghiệm mẫu</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* SAFENET AI – LÁ CHẮN CÔNG DÂN SỐ SHOWCASE SECTION */}
      <section className="py-16 bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Chủ đề: Ứng dụng AI có trách nhiệm • Nhà sáng tạo AI trong học đường</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              SAFENET AI <span className="text-teal-400">– LÁ CHẮN CÔNG DÂN SỐ</span>
            </h2>

            <p className="text-amber-300 font-semibold text-sm sm:text-base italic">
              "Nhận diện thông minh – Ứng phó an toàn – Làm chủ không gian số."
            </p>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
              Môi trường học tập tương tác giả lập các tình huống lừa đảo mạng, tin giả mạo, cuộc gọi Deepfake
              và bắt nạt mạng. Rèn luyện phản xạ số tự bảo vệ mình cho học sinh THPT.
            </p>
          </div>

          {/* 4 Feature Pillars of SafeNet AI */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 space-y-3 hover:border-teal-400/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xl border border-rose-500/30">
                🚨
              </div>
              <h3 className="font-extrabold text-base text-white">Giả lập Bẫy OTP & Phishing</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Mô phỏng tin nhắn trúng thưởng mạo danh, link lạ .xyz và tình huống ép nộp mã xác thực OTP bí mật.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 space-y-3 hover:border-teal-400/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xl border border-purple-500/30">
                🤖
              </div>
              <h3 className="font-extrabold text-base text-white">Cảnh giác Deepfake AI</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Phát hiện video giả khuôn mặt và giọng nói mượn tiền gấp; rèn kỹ năng xác thực kênh viễn thông SIM.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 space-y-3 hover:border-teal-400/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xl border border-amber-500/30">
                🔍
              </div>
              <h3 className="font-extrabold text-base text-white">Kiểm chứng SIFT & Soi Tin Giả</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Phản xạ kiểm tra nguồn tin, phát hiện file mã độc ngụy trang tài liệu ôn thi và bẫy nạp tiền cọc việc làm.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 space-y-3 hover:border-teal-400/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xl border border-teal-500/30">
                🛡️
              </div>
              <h3 className="font-extrabold text-base text-white">Bảo vệ PII & Văn hóa Mạng</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Chống bạo lực mạng học đường (Cyberbullying), ngăn chặn lộ thông tin cá nhân và hình thành đạo đức số.
              </p>
            </div>
          </div>

          {/* CTA Box */}
          <div className="bg-teal-950/60 border border-teal-500/40 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="font-bold text-white text-sm sm:text-base flex items-center gap-2 justify-center sm:justify-start">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Trải nghiệm ngay Đấu trường Phản xạ An toàn số SafeNet AI</span>
              </div>
              <p className="text-xs text-teal-200">
                Có sẵn 5 kịch bản thực nghiệm, công cụ Trạm Soi Tin Giả và biểu đồ Radar năng lực công dân số.
              </p>
            </div>

            <button
              onClick={() => setActiveView('safenet_ai')}
              className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-teal-500/30 flex items-center gap-2 transition-all cursor-pointer shrink-0"
            >
              <span>Vào Phân hệ SafeNet AI</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 6 Core Functional Areas */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              6 KHÔNG GIAN CHỨC NĂNG TOÀN DIỆN
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Hệ sinh thái học tập số được thiết kế chuyên biệt cho môi trường giáo dục phổ thông Việt Nam (THPT Nguyễn Dục).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  onClick={() => setActiveView(item.action)}
                  className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${item.color} group-hover:scale-105 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-semibold">
                    <span>Mở chức năng</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-800">
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-2 text-white font-extrabold text-base">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Laptop className="w-5 h-5 text-white" />
                </div>
                <span>NGUYỄN DỤC AI LEARNING HUB</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Nền tảng lớp học số tích hợp AI – Đổi mới phương pháp dạy học và kiểm tra đánh giá theo định hướng Chương trình GDPT 2018 môn Tin học.
              </p>
              <div className="text-xs text-slate-500">
                Đơn vị: Trường THPT Nguyễn Dục • Huyện Duy Xuyên, Tỉnh Quảng Nam
              </div>
            </div>

            <div className="md:col-span-3 space-y-2">
              <h4 className="text-white text-xs font-bold uppercase tracking-wider">Khám phá chức năng</h4>
              <ul className="text-xs space-y-1.5">
                <li><button onClick={() => setActiveView('reviewer_4c')} className="hover:text-white transition-colors">Nộp bài & AI 4C</button></li>
                <li><button onClick={() => setActiveView('tutor_chat')} className="hover:text-white transition-colors">AI Gia sư học tập</button></li>
                <li><button onClick={() => setActiveView('discussions')} className="hover:text-white transition-colors">Diễn đàn thảo luận</button></li>
                <li><button onClick={() => setActiveView('analytics')} className="hover:text-white transition-colors">Báo cáo tiến bộ học sinh</button></li>
                <li><button onClick={() => setActiveView('responsible_ai')} className="hover:text-white transition-colors">Trung tâm AI có trách nhiệm</button></li>
              </ul>
            </div>

            <div className="md:col-span-4 space-y-2">
              <h4 className="text-white text-xs font-bold uppercase tracking-wider">Nguyên tắc sư phạm</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                "Công nghệ và AI là công cụ hỗ trợ người thầy truyền cảm hứng và giúp học trò tự kiến tạo tri thức, không bao giờ thay thế nỗ lực tự học và sự sáng tạo của con người."
              </p>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <div>© 2024 - 2025 Nguyễn Dục AI Learning Hub. Bảo lưu mọi quyền.</div>
            <div>Trường THPT Nguyễn Dục • Quảng Nam</div>
          </div>
        </div>
      </footer>
    </div>
  );
};
