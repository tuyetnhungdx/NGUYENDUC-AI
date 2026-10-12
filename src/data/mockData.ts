import { User, ClassRoom, Assignment, Submission, DiscussionPost, AuditLog } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_teacher_1',
    name: 'Cô Trần Thị Tuyết Nhung',
    username: 'nhung.ttt',
    password: '123',
    email: 'nhung.ttt@thptnguyenduc.edu.vn',
    role: 'TEACHER',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    school: 'Trường THPT Nguyễn Dục',
    bio: 'Giáo viên Tin học',
    joinedDate: '2023-09-01',
  },
  {
    id: 'user_student_1',
    name: 'Trần Thị Mai Anh',
    username: 'maianh',
    password: '123',
    email: 'maianh.hs1201@thptnguyenduc.edu.vn',
    role: 'STUDENT',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    classId: 'class_12a1',
    className: '12A1',
    school: 'Trường THPT Nguyễn Dục',
    bio: 'Học sinh lớp 12A1 – Đam mê thiết kế web và trí tuệ nhân tạo',
    joinedDate: '2024-09-05',
  },
  {
    id: 'user_student_2',
    name: 'Lê Hoàng Nam',
    username: 'hoangnam',
    password: '123',
    email: 'nam.hs1202@thptnguyenduc.edu.vn',
    role: 'STUDENT',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    classId: 'class_12a1',
    className: '12A1',
    school: 'Trường THPT Nguyễn Dục',
    bio: 'Học sinh 12A1 – Trưởng nhóm CLB Tin học Nguyễn Dục',
    joinedDate: '2024-09-05',
  },
  {
    id: 'user_student_3',
    name: 'Phạm Thảo Vy',
    username: 'thaovy',
    password: '123',
    email: 'vy.hs1203@thptnguyenduc.edu.vn',
    role: 'STUDENT',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    classId: 'class_12a2',
    className: '12A2',
    school: 'Trường THPT Nguyễn Dục',
    bio: 'Học sinh 12A2 – Thành viên ban truyền thông Đoàn trường',
    joinedDate: '2024-09-05',
  },
  {
    id: 'user_admin_1',
    name: 'Quản trị viên Hệ thống (BGH)',
    username: 'admin',
    password: '123',
    email: 'quantri@thptnguyenduc.edu.vn',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    school: 'Trường THPT Nguyễn Dục',
    bio: 'Ban Quản trị Nền tảng Nguyễn Dục AI Learning Hub',
    joinedDate: '2023-08-15',
  },
];

export const INITIAL_CLASSES: ClassRoom[] = [
  {
    id: 'class_12a1',
    name: '12A1',
    subject: 'Tin học 12',
    grade: '12',
    academicYear: '2024 - 2025',
    code: 'ND-12A1-TH',
    teacherId: 'user_teacher_1',
    teacherName: 'Cô Trần Thị Tuyết Nhung',
    studentCount: 38,
    description: 'Lớp 12A1 ban Tự nhiên – Học kỳ I: Thiết kế Web HTML/CSS & Cơ sở dữ liệu',
    color: '#2563EB',
    bannerGradient: 'from-blue-600 to-indigo-800',
    announcements: [
      {
        id: 'ann_1',
        title: 'Nhắc nhở nộp Bài thực hành 9: Danh sách & Bảng HTML',
        content: 'Các em lưu ý hạn chót nộp bài là 23h59 Chủ nhật. Hãy sử dụng Trợ lý AI 4C để chẩn đoán lỗi cú pháp và tự hoàn thiện trước khi gửi bản cuối.',
        createdAt: '2024-10-10 08:30',
        authorName: 'Cô Trần Thị Tuyết Nhung',
      },
      {
        id: 'ann_2',
        title: 'Tài liệu hướng dẫn lồng ghép bảng và danh sách chuẩn W3C',
        content: 'Cô đã đính kèm tài liệu tham khảo bài 9 trong mục Tài liệu học tập. Các em nhớ ôn lại cấu trúc <thead>, <tbody>, <tr>, <th>, <td>.',
        createdAt: '2024-10-08 14:15',
        authorName: 'Cô Trần Thị Tuyết Nhung',
      },
    ],
  },
  {
    id: 'class_12a2',
    name: '12A2',
    subject: 'Tin học 12',
    grade: '12',
    academicYear: '2024 - 2025',
    code: 'ND-12A2-TH',
    teacherId: 'user_teacher_1',
    teacherName: 'Cô Trần Thị Tuyết Nhung',
    studentCount: 40,
    description: 'Lớp 12A2 ban Tự nhiên – Chuyên đề Tin học ứng dụng',
    color: '#06B6D4',
    bannerGradient: 'from-cyan-600 to-blue-800',
    announcements: [
      {
        id: 'ann_3',
        title: 'Khởi động chuyên đề HTML5',
        content: 'Chào mừng các em lớp 12A2 đến với không gian học tập số AI Learning Hub.',
        createdAt: '2024-10-05 09:00',
        authorName: 'Cô Trần Thị Tuyết Nhung',
      },
    ],
  },
  {
    id: 'class_11a1',
    name: '11A1',
    subject: 'Tin học 11',
    grade: '11',
    academicYear: '2024 - 2025',
    code: 'ND-11A1-TH',
    teacherId: 'user_teacher_1',
    teacherName: 'Cô Trần Thị Tuyết Nhung',
    studentCount: 42,
    description: 'Lớp 11A1 – Lập trình Python và Thuật toán cơ bản',
    color: '#10B981',
    bannerGradient: 'from-emerald-600 to-teal-800',
    announcements: [
      {
        id: 'ann_4',
        title: 'Luyện tập cấu trúc rẽ nhánh và lặp',
        content: 'Hãy hỏi Trợ lý AI khi gặp lỗi IndentationError hoặc SyntaxError nhé!',
        createdAt: '2024-10-07 10:20',
        authorName: 'Cô Trần Thị Tuyết Nhung',
      },
    ],
  },
];

// FLAGGED DEMO HTML WITH INTENTIONAL ERRORS AS REQUIRED IN SECTION 9
export const DEMO_FLAWED_HTML = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>CLB Tin học THPT Nguyễn Dục</title>
</head>
<body>
    <h1>Chào mừng đến với Câu lạc bộ Tin học Nguyễn Dục</h1>
    <p>Nơi giao lưu, học hỏi và chia sẻ niềm đam mê công nghệ số!</p>

    <!-- 1. Danh sách hoạt động (Sử dụng ul) -->
    <h2>Các hoạt động chính</h2>
    <ul>
        <li>Lập trình Web và ứng dụng di động</li>
        <li>Nghiên cứu Trí tuệ nhân tạo (AI) học đường
        <li>Luyện thi Tin học trẻ và Robocon</li>
    </ul>

    <!-- 2. Danh sách thành viên (Thiếu thẻ ol, dùng p hoặc li rời rạc) -->
    <h2>Ban chủ nhiệm Câu lạc bộ</h2>
    <!-- LỖI CỐ Ý DEMO: Chưa dùng thẻ <ol> chuẩn theo rubric yêu cầu -->
    <p>1. Lê Hoàng Nam - Chủ nhiệm CLB</p>
    <p>2. Trần Thị Mai Anh - Phó chủ nhiệm học thuật</p>
    <p>3. Phạm Thảo Vy - Trưởng ban truyền thông</p>

    <!-- 3. Bảng lịch sinh hoạt (Cấu trúc table bị lỗi cố ý) -->
    <h2>Lịch sinh hoạt thường kỳ</h2>
    <!-- LỖI CỐ Ý DEMO: Thiếu thẻ thead/tbody chuẩn, quên đóng thẻ </tr> và unclosed table tag -->
    <table border="1" cellpadding="8">
        <tr>
            <th>Thứ</th>
            <th>Thời gian</th>
            <th>Nội dung sinh hoạt</th>
            <th>Địa điểm</th>
        </tr>
        <tr>
            <td>Thứ Bảy</td>
            <td>14:00 - 16:30</td>
            <td>Workshop: Tích hợp AI vào sản phẩm Web</td>
            <td>Phòng máy số 2
        <!-- LỖI: Quên đóng thẻ </tr> ở hàng trên -->
        <tr>
            <td>Chủ Nhật</td>
            <td>08:00 - 10:30</td>
            <td>Sinh hoạt chuyên đề Tin học 12</td>
            <td>Phòng Đa năng</td>
        </tr>
    <!-- LỖI CỐ Ý DEMO: Quên đóng thẻ </table> kết thúc bảng -->
    
    <p>Liên hệ: clbtinhoc@thptnguyenduc.edu.vn</p>
</body>
</html>`;

// CORRECTED HTML (VERSION 2) FOR DEMONSTRATING C4 PROGRESS
export const DEMO_CORRECTED_HTML = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CLB Tin học THPT Nguyễn Dục</title>
</head>
<body>
    <h1>Chào mừng đến với Câu lạc bộ Tin học Nguyễn Dục</h1>
    <p>Nơi giao lưu, học hỏi và chia sẻ niềm đam mê công nghệ số!</p>

    <!-- 1. Danh sách không thứ tự (ul) -->
    <h2>Các hoạt động chính của CLB</h2>
    <ul>
        <li>Lập trình Web hiện đại và ứng dụng di động</li>
        <li>Nghiên cứu Trí tuệ nhân tạo (AI) học đường</li>
        <li>Luyện thi Tin học trẻ và Robocon sáng tạo</li>
        <li>Hỗ trợ học sinh trong trường làm quen với công nghệ</li>
    </ul>

    <!-- 2. Danh sách có thứ tự (ol) - Đã sửa theo gợi ý AI Mức 2 -->
    <h2>Ban chủ nhiệm Câu lạc bộ</h2>
    <ol>
        <li>Lê Hoàng Nam - Chủ nhiệm CLB</li>
        <li>Trần Thị Mai Anh - Phó chủ nhiệm học thuật</li>
        <li>Phạm Thảo Vy - Trưởng ban truyền thông</li>
    </ol>

    <!-- 3. Bảng lịch sinh hoạt - Đã hoàn thiện cấu trúc thead/tbody/tr/td -->
    <h2>Lịch sinh hoạt thường kỳ</h2>
    <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse;">
        <thead>
            <tr style="background-color: #2563EB; color: white;">
                <th>Thứ</th>
                <th>Thời gian</th>
                <th>Nội dung sinh hoạt</th>
                <th>Địa điểm</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Thứ Bảy</td>
                <td>14:00 - 16:30</td>
                <td>Workshop: Tích hợp AI vào sản phẩm Web</td>
                <td>Phòng máy số 2</td>
            </tr>
            <tr style="background-color: #F8FAFC;">
                <td>Chủ Nhật</td>
                <td>08:00 - 10:30</td>
                <td>Sinh hoạt chuyên đề Tin học 12</td>
                <td>Phòng Đa năng</td>
            </tr>
        </tbody>
    </table>
    
    <footer style="margin-top: 20px; font-style: italic; color: #475569;">
        <p>Liên hệ: clbtinhoc@thptnguyenduc.edu.vn | Hotline: 0235.385.1234</p>
        <p>Trường THPT Nguyễn Dục - Tỉnh Quảng Nam</p>
    </footer>
</body>
</html>`;

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg_bai9_html',
    title: 'Tin học 12 – Bài 9: Tạo danh sách, bảng',
    classId: 'class_12a1',
    className: '12A1',
    subject: 'Tin học 12',
    teacherId: 'user_teacher_1',
    teacherName: 'Cô Trần Thị Tuyết Nhung',
    description: 'Thiết kế trang web giới thiệu Câu lạc bộ Tin học, có danh sách hoạt động, danh sách thành viên và bảng lịch sinh hoạt.',
    requirements: [
        'Khai báo đầy đủ cấu trúc chuẩn HTML5 (DOCTYPE, html, head, title, body).',
        'Sử dụng danh sách không thứ tự (thẻ <ul> và <li>) để liệt kê các hoạt động của CLB.',
        'Sử dụng danh sách có thứ tự (thẻ <ol> và <li>) để liệt kê danh sách ban chủ nhiệm CLB.',
        'Tạo bảng lịch sinh hoạt (thẻ <table>, <thead>, <tbody>, <tr>, <th>, <td>) có ít nhất 2 buổi sinh hoạt.',
        'Nội dung phong phú, ngữ nghĩa rõ ràng, tiếng Việt có dấu chuẩn xác.',
    ],
    rubric: [
      {
        id: 'rub_1',
        name: 'Cấu trúc HTML',
        weight: 20,
        maxPoints: 2.0,
        description: 'Đầy đủ DOCTYPE, html, head, title, body; các thẻ mở và đóng ăn khớp đúng cặp.',
        expectedStructure: '<!DOCTYPE html> <html> <head> <body>',
      },
      {
        id: 'rub_2',
        name: 'Danh sách không thứ tự',
        weight: 20,
        maxPoints: 2.0,
        description: 'Sử dụng đúng thẻ <ul> và các mục <li> lồng bên trong để hiển thị hoạt động CLB.',
        expectedStructure: '<ul> <li>...</li> </ul>',
      },
      {
        id: 'rub_3',
        name: 'Danh sách có thứ tự',
        weight: 20,
        maxPoints: 2.0,
        description: 'Sử dụng đúng thẻ <ol> và các mục <li> để liệt kê danh sách ban chủ nhiệm có đánh số.',
        expectedStructure: '<ol> <li>...</li> </ol>',
      },
      {
        id: 'rub_4',
        name: 'Cấu trúc bảng',
        weight: 25,
        maxPoints: 2.5,
        description: 'Sử dụng thẻ <table>, <tr>, <th>, <td> đóng mở hoàn chỉnh, tổ chức thông tin lịch sinh hoạt.',
        expectedStructure: '<table> <tr> <th>/<td>',
      },
      {
        id: 'rub_5',
        name: 'Nội dung và trình bày',
        weight: 15,
        maxPoints: 1.5,
        description: 'Thông tin chân thực về CLB Tin học Nguyễn Dục, ngôn từ chuẩn mực, bố cục rõ ràng.',
        expectedStructure: 'h1, h2, p, footer',
      },
    ],
    maxScore: 10,
    startDate: '2024-10-06 08:00',
    dueDate: '2024-10-18 23:59',
    status: 'published',
    allowedResubmissions: 3,
    aiAssistantEnabled: true,
    aiSupportLevel: 'full',
    starterTemplate: `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>Giới thiệu CLB Tin học</title>
</head>
<body>
    <!-- Học sinh viết mã tại đây -->
</body>
</html>`,
    isDemo: true,
  },
  {
    id: 'asg_bai8_layout',
    title: 'Tin học 12 – Bài 8: Định dạng văn bản và liên kết web',
    classId: 'class_12a1',
    className: '12A1',
    subject: 'Tin học 12',
    teacherId: 'user_teacher_1',
    teacherName: 'Cô Trần Thị Tuyết Nhung',
    description: 'Xây dựng trang cá nhân giới thiệu bản thân và liên kết tới trang web của trường THPT Nguyễn Dục.',
    requirements: [
      'Sử dụng các thẻ tiêu đề h1 đến h4',
      'Định dạng chữ in đậm (strong/b), in nghiêng (em/i)',
      'Thêm ít nhất 2 liên kết siêu văn bản <a>',
    ],
    rubric: [
      { id: 'r1', name: 'Thẻ tiêu đề và đoạn văn', weight: 40, maxPoints: 4, description: 'Sử dụng linh hoạt h1-h4, p' },
      { id: 'r2', name: 'Định dạng liên kết', weight: 40, maxPoints: 4, description: 'Liên kết hoạt động tốt với thẻ a' },
      { id: 'r3', name: 'Tính thẩm mỹ', weight: 20, maxPoints: 2, description: 'Giao diện hài hòa' },
    ],
    maxScore: 10,
    startDate: '2024-09-28 08:00',
    dueDate: '2024-10-05 23:59',
    status: 'published',
    allowedResubmissions: 2,
    aiAssistantEnabled: true,
    aiSupportLevel: 'moderate',
  },
];

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub_1201_bai9',
    assignmentId: 'asg_bai9_html',
    assignmentTitle: 'Tin học 12 – Bài 9: Tạo danh sách, bảng',
    studentId: 'user_student_1',
    studentName: 'Trần Thị Mai Anh',
    studentCode: 'HS1201',
    classId: 'class_12a1',
    className: '12A1',
    status: 'submitted',
    currentVersion: 2,
    teacherGrade: 9.5,
    teacherComment: 'Rất khen ngợi Mai Anh! Cô đã đọc kỹ chỉ dẫn của AI để tự đóng lại thẻ <table> và chuyển danh sách thành viên sang thẻ <ol> chuẩn xác. Sự tiến bộ giữa Lần 1 và Lần 2 rất rõ ràng.',
    teacherReviewedAt: '2024-10-11 16:40',
    isConfirmedByTeacher: true,
    totalTimeMinutes: 45,
    versions: [
      {
        versionNumber: 1,
        submittedAt: '2024-10-10 19:30',
        htmlContent: DEMO_FLAWED_HTML,
        notes: 'Bản nộp ban đầu của học sinh (Có lỗi cố ý trong tình huống demo)',
        aiFeedback: {
          timestamp: '2024-10-10 19:31',
          summary: 'Em đã xây dựng được khung bài tương đối đầy đủ. Tuy nhiên còn một số lỗi cú pháp thẻ bảng và danh sách cần chỉnh sửa để trang web hiển thị đúng chuẩn.',
          scoreEstimate: 6.0,
          passedCriteria: ['Cấu trúc cơ bản HTML', 'Danh sách không thứ tự (ul)'],
          improvedCriteria: ['Cấu trúc đóng/mở thẻ bảng (table)', 'Danh sách có thứ tự (ol)'],
          issues: [
            {
              element: 'table',
              line: 30,
              priority: 'high',
              level1Hint: 'Mức 1: Em hãy kiểm tra cấu trúc bảng HTML, có một phần thẻ chưa được đóng hoàn chỉnh.',
              level2Hint: 'Mức 2: Em hãy nhớ lại chức năng của các thẻ table, tr, th và td. Kiểm tra xem các thẻ mở đã có thẻ đóng tương ứng chưa nhé.',
              level3Hint: 'Mức 3: Thử kiểm tra dòng 30-40: Hàng tr chứa "Phòng máy số 2" bị thiếu thẻ đóng </tr>, và cuối bảng đang thiếu thẻ đóng </table>.',
            },
            {
              element: 'ol',
              line: 22,
              priority: 'medium',
              level1Hint: 'Mức 1: Phần danh sách Ban chủ nhiệm chưa sử dụng đúng thẻ danh sách có thứ tự.',
              level2Hint: 'Mức 2: Trong HTML, khi cần danh sách đánh số tự động 1, 2, 3... ta dùng cặp thẻ <ol> và <li> thay vì gõ số thủ công trong thẻ <p>.',
              level3Hint: 'Mức 3: Em hãy thử thay các thẻ <p>1. ...</p> bằng cấu trúc <ol> <li>Lê Hoàng Nam...</li> <li>Trần Thị Mai Anh...</li> </ol>.',
            },
          ],
          rubricResults: [
            { criteria: 'Cấu trúc HTML', status: 'partial', comment: 'Đã có doctype và html, nhưng thẻ bảng lồng sai' },
            { criteria: 'Danh sách không thứ tự', status: 'passed', comment: 'Sử dụng tốt ul và li cho hoạt động' },
            { criteria: 'Danh sách có thứ tự', status: 'failed', comment: 'Chưa dùng thẻ ol theo yêu cầu rubric' },
            { criteria: 'Cấu trúc bảng', status: 'partial', comment: 'Chưa đóng thẻ table và tr' },
            { criteria: 'Nội dung và trình bày', status: 'passed', comment: 'Nội dung phù hợp với CLB Tin học' },
          ],
          pedagogicalPraise: 'Mai Anh có ý tưởng trình bày rất tốt, bố cục rõ ràng! Em hãy xem các gợi ý phía dưới để tự hoàn thiện nhé.',
          hintsUsedCount: 2,
          unlockedHintLevels: { 0: 2, 1: 1 },
        },
        resolvedIssuesCount: 0,
        unresolvedIssuesCount: 2,
      },
      {
        versionNumber: 2,
        submittedAt: '2024-10-10 20:15',
        htmlContent: DEMO_CORRECTED_HTML,
        notes: 'Bản nộp sau khi học sinh tự sửa theo gợi ý AI 4C',
        aiFeedback: {
          timestamp: '2024-10-10 20:16',
          summary: 'Xuất sắc! Em đã khắc phục hoàn toàn các lỗi ở Lần 1: đã bổ sung thẻ <ol> chuẩn, hoàn thiện bảng với thead/tbody và đóng đầy đủ các thẻ.',
          scoreEstimate: 9.5,
          passedCriteria: [
            'Cấu trúc HTML chuẩn W3C',
            'Danh sách không thứ tự (ul, li)',
            'Danh sách có thứ tự (ol, li)',
            'Cấu trúc bảng hoàn chỉnh (thead, tbody, tr, th, td)',
            'Trình bày thẩm mỹ có phong cách',
          ],
          improvedCriteria: [],
          issues: [],
          rubricResults: [
            { criteria: 'Cấu trúc HTML', status: 'passed', comment: 'Cấu trúc chuẩn, đóng mở thẻ hoàn hảo' },
            { criteria: 'Danh sách không thứ tự', status: 'passed', comment: 'Đạt chuẩn' },
            { criteria: 'Danh sách có thứ tự', status: 'passed', comment: 'Đã khắc phục xuất sắc bằng cặp thẻ ol/li' },
            { criteria: 'Cấu trúc bảng', status: 'passed', comment: 'Đã khắc phục lỗi thẻ đóng, bổ sung CSS trực quan' },
            { criteria: 'Nội dung và trình bày', status: 'passed', comment: 'Chân thực, đẹp mắt' },
          ],
          pedagogicalPraise: 'Tuyệt vời! Em đã chứng minh sự tiến bộ vượt bậc thông qua việc tự sửa bài thay vì nhờ người khác làm hộ.',
          hintsUsedCount: 0,
          unlockedHintLevels: {},
        },
        resolvedIssuesCount: 2,
        unresolvedIssuesCount: 0,
      },
    ],
  },
  {
    id: 'sub_1202_bai9',
    assignmentId: 'asg_bai9_html',
    assignmentTitle: 'Tin học 12 – Bài 9: Tạo danh sách, bảng',
    studentId: 'user_student_2',
    studentName: 'Lê Hoàng Nam',
    studentCode: 'HS1202',
    classId: 'class_12a1',
    className: '12A1',
    status: 'in_progress',
    currentVersion: 1,
    teacherGrade: undefined,
    isConfirmedByTeacher: false,
    totalTimeMinutes: 20,
    versions: [
      {
        versionNumber: 1,
        submittedAt: '2024-10-11 10:10',
        htmlContent: DEMO_FLAWED_HTML,
        notes: 'Bản thảo ban đầu đang chờ AI phân tích',
        aiFeedback: undefined,
      },
    ],
  },
];

export const INITIAL_DISCUSSIONS: DiscussionPost[] = [
  {
    id: 'disc_1',
    classId: 'class_12a1',
    className: '12A1',
    authorId: 'user_student_1',
    authorName: 'Trần Thị Mai Anh',
    authorRole: 'STUDENT',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    title: 'Làm thế nào để tạo đường viền mỏng và liền mạch cho thẻ table trong HTML?',
    content: 'Thầy và các bạn cho mình hỏi: Khi mình dùng border="1" thì đường viền bảng bị đúp thành 2 nét nhìn hơi thô. Có cách nào để đường viền bảng chỉ còn 1 nét đơn mỏng đẹp không ạ?',
    category: 'bai_tap',
    tags: ['HTML', 'table', 'CSS', 'Bài 9'],
    createdAt: '2024-10-09 20:15',
    likes: 8,
    isSolved: true,
    comments: [
      {
        id: 'comm_1',
        authorId: 'user_teacher_1',
        authorName: 'Cô Trần Thị Tuyết Nhung',
        authorRole: 'TEACHER',
        authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        content: 'Chào Mai Anh! Câu hỏi rất hay. Trong CSS, cô gợi ý em có thể thêm thuộc tính `style="border-collapse: collapse;"` vào thẻ `<table>`. Thuộc tính này sẽ gộp các đường viền liền kề của ô thành 1 nét đơn mỏng rất đẹp mắt nhé.',
        createdAt: '2024-10-09 20:45',
        isHelpful: true,
      },
      {
        id: 'comm_2',
        authorId: 'user_student_2',
        authorName: 'Lê Hoàng Nam',
        authorRole: 'STUDENT',
        authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        content: 'Mình vừa áp dụng cách cô chỉ, bảng nhìn đẹp hơn hẳn! Cảm ơn cô và bạn Mai Anh đã hỏi.',
        createdAt: '2024-10-09 21:00',
      },
    ],
  },
  {
    id: 'disc_2',
    classId: 'class_12a1',
    className: '12A1',
    authorId: 'user_teacher_1',
    authorName: 'Cô Trần Thị Tuyết Nhung',
    authorRole: 'TEACHER',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    title: '[Chủ đề thảo luận tuần] Phân biệt sự khác nhau giữa thẻ <th> và <td>',
    content: 'Các em hãy thảo luận nhanh: Thẻ <th> và <td> khác nhau như thế nào về mặt mặc định hiển thị và ý nghĩa ngữ nghĩa (semantic) trong văn bản HTML?',
    category: 'ly_thuyet',
    tags: ['Tin học 12', 'Ngữ nghĩa HTML', 'th vs td'],
    createdAt: '2024-10-07 15:00',
    likes: 12,
    isPinned: true,
    comments: [
      {
        id: 'comm_3',
        authorId: 'user_student_1',
        authorName: 'Trần Thị Mai Anh',
        authorRole: 'STUDENT',
        authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        content: 'Dạ thưa cô, thẻ <th> là tiêu đề của cột/hàng nên mặc định được in đậm và căn giữa. Còn <td> là ô dữ liệu bình thường, chữ thẳng và căn lề trái ạ.',
        createdAt: '2024-10-07 15:20',
        isHelpful: true,
      },
    ],
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_1',
    timestamp: '2024-10-12 08:45:10',
    userName: 'Cô Trần Thị Tuyết Nhung',
    userRole: 'TEACHER',
    action: 'CONFIRM_SUBMISSION_GRADE',
    target: 'Bài 9 - Trần Thị Mai Anh (12A1)',
    details: 'Giáo viên xác nhận kết quả phiên bản 2 đạt 9.5 điểm (Đã sửa xong 2 lỗi theo 4C)',
  },
  {
    id: 'log_2',
    timestamp: '2024-10-10 20:15:22',
    userName: 'Trần Thị Mai Anh',
    userRole: 'STUDENT',
    action: 'RESUBMIT_VERSION',
    target: 'Tin học 12 – Bài 9 (Version 2)',
    details: 'Học sinh nộp lại mã HTML sau khi nhận chỉ dẫn từ AI Reviewer',
  },
  {
    id: 'log_3',
    timestamp: '2024-10-10 19:31:05',
    userName: 'Hệ thống AI 4C',
    userRole: 'ADMIN',
    action: 'AI_DIAGNOSTIC_GENERATED',
    target: 'Bài 9 - Lần nộp 1',
    details: 'Chẩn đoán 2 vấn đề cú pháp (table, ol); Tạo gợi ý 3 mức độ sư phạm',
  },
  {
    id: 'log_4',
    timestamp: '2024-10-06 08:00:00',
    userName: 'Cô Trần Thị Tuyết Nhung',
    userRole: 'TEACHER',
    action: 'CREATE_ASSIGNMENT',
    target: 'Tin học 12 – Bài 9: Tạo danh sách, bảng',
    details: 'Giao nhiệm vụ cho lớp 12A1 với 5 tiêu chí Rubric và bật Trợ lý AI 4C',
  },
];
