import { SafeNetScenario, SafeNetStudentAttempt, SafeNetChallenge } from '../types';

export const INITIAL_SAFENET_SCENARIOS: SafeNetScenario[] = [
  {
    id: 'scen_phishing_1',
    title: 'Tin nhắn trúng thưởng iPhone 16 Pro Max & Đòi mã OTP',
    category: 'phishing',
    difficulty: 'co_ban',
    description:
      'Học sinh nhận được tin nhắn SMS/Zalo thông báo trúng thưởng điện thoại đắt tiền nhân dịp kỷ niệm, yêu cầu truy cập website lạ và điền thông tin tài khoản kèm mã OTP.',
    targetGrade: 'Khối 10, 11, 12',
    createdByType: 'teacher',
    assignedClassIds: ['class_12a1', 'class_12a2'],
    senderInfo: {
      name: 'Hệ Thống Tri Ân KH - Quà Tặng Công Nghệ',
      avatar: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=120&auto=format&fit=crop&q=80',
      handleOrNumber: 'CSKH-TRIAN2025 (Brandname giả)',
      platform: 'SMS',
      verifiedBadge: false,
    },
    context:
      'Vào lúc 21:15 tối, khi bạn đang làm bài tập thì điện thoại rung báo tin nhắn SMS từ đầu số lạ tự xưng là tổng đài chăm sóc khách hàng.',
    stages: [
      {
        stageId: 1,
        timeAgo: 'Vừa xong',
        promptText:
          'CHÚC MỪNG! Số điện thoại của bạn đã may mắn trúng giải Đặc biệt: 01 iPhone 16 Pro Max 256GB trị giá 34.990.000đ. Nhấn vào liên kết http://fptshop-quatang-kh2025.xyz/nhanqua để hoàn tất thủ tục nhận máy trong vòng 15 phút. Quá hạn phần thưởng sẽ bị hủy!',
        redFlags: [
          {
            id: 'rf_domain',
            label: 'Tên miền giả mạo .xyz',
            explanation: 'Website chính thức của FPT Shop là fptshop.com.vn, không bao giờ dùng đuôi lạ .xyz hay tên miền dài ngoằng.',
          },
          {
            id: 'rf_urgency',
            label: 'Tạo tâm lý khẩn cấp',
            explanation: 'Kẻ lừa đảo luôn ép thời gian ("trong 15 phút") để nạn nhân mất cảnh giác, không kịp suy nghĩ hoặc hỏi người thân.',
          },
          {
            id: 'rf_unsolicited',
            label: 'Trúng thưởng bất ngờ không tham gia',
            explanation: 'Bạn chưa từng tham gia quay số hay bốc thăm, không có lý do gì tự nhiên trúng giải thưởng lớn.',
          },
        ],
        choices: [
          {
            id: 'c1_click',
            text: 'Nhấp ngay vào liên kết để xem thủ tục nhận thưởng kẻo hết 15 phút',
            isSafeAction: false,
            score: 0,
            aiMentorFeedback:
              'Rất nguy hiểm! Nhấp vào liên kết lạ có thể dẫn đến trang web độc hại đánh cắp cookie, tự động tải mã độc hoặc chuyển bạn đến trang đăng nhập giả.',
            competencyImpact: {
              threatIdentification: 0,
              safeResponse: 0,
              dataProtection: 0,
              criticalThinking: 0,
              digitalCulture: 5,
            },
          },
          {
            id: 'c2_verify_official',
            text: 'Không nhấp vào link, kiểm tra lại số điện thoại và tra cứu trên trang web chính thức hoặc hỏi người lớn',
            isSafeAction: true,
            score: 95,
            aiMentorFeedback:
              'Chính xác! Phản xạ dừng lại (STOP) và không nhấp vào đường link lạ là bước đầu tiên của công dân số thông minh.',
            competencyImpact: {
              threatIdentification: 95,
              safeResponse: 90,
              dataProtection: 95,
              criticalThinking: 95,
              digitalCulture: 90,
            },
          },
          {
            id: 'c3_reply_sms',
            text: 'Nhắn tin lại hỏi: "Có phải thật không, gửi quà về trường THPT Nguyễn Dục cho tôi nhé"',
            isSafeAction: false,
            score: 35,
            aiMentorFeedback:
              'Phản hồi tin nhắn rác/lừa đảo sẽ xác nhận số điện thoại của bạn đang hoạt động, khiến bạn bị kẻ xấu tiếp tục nhắm mục tiêu công kích.',
            competencyImpact: {
              threatIdentification: 40,
              safeResponse: 30,
              dataProtection: 40,
              criticalThinking: 30,
              digitalCulture: 50,
            },
          },
        ],
      },
      {
        stageId: 2,
        timeAgo: '2 phút sau',
        promptText:
          'Giả sử bạn vô tình mở trang web đó, giao diện hiển thị logo FPT Shop rất giống thật và có biểu mẫu yêu cầu: "Nhập Số điện thoại, Mật khẩu tài khoản MoMo/Ngân hàng và Mã xác thực OTP gửi về máy để đóng phí bảo hiểm vận chuyển 50.000đ". Bạn làm gì?',
        redFlags: [
          {
            id: 'rf_otp_sharing',
            label: 'Đòi hỏi cung cấp mã OTP bí mật',
            explanation: 'Mã OTP là mật khẩu một lần dùng để xác thực giao dịch chuyển tiền. Không một tổ chức uy tín nào được phép yêu cầu người dùng đọc mã OTP.',
          },
          {
            id: 'rf_fee_before_reward',
            label: 'Yêu cầu nộp tiền trước để nhận quà',
            explanation: 'Chiêu bài kinh điển: lấy lý do đóng phí bảo hiểm, phí vận chuyển để rút sạch tiền trong tài khoản của nạn nhân.',
          },
        ],
        choices: [
          {
            id: 'c2_give_otp',
            text: 'Điền mã OTP vì nghĩ phí vận chuyển chỉ có 50.000đ rất nhỏ so với iPhone 35 triệu',
            isSafeAction: false,
            score: 0,
            aiMentorFeedback:
              'Sai lầm nghiêm trọng! Khi bạn cung cấp OTP, kẻ lừa đảo sẽ lập tức chiếm quyền tài khoản và chuyển sạch toàn bộ số dư có trong ví điện tử của bạn.',
            competencyImpact: {
              threatIdentification: 0,
              safeResponse: 0,
              dataProtection: 0,
              criticalThinking: 0,
              digitalCulture: 10,
            },
          },
          {
            id: 'c2_close_and_report',
            text: 'Lập tức đóng tab, chụp ảnh màn hình làm bằng chứng cảnh báo cho bạn bè và báo cáo tin nhắn rác tới tổng đài 156 / 5656',
            isSafeAction: true,
            score: 100,
            aiMentorFeedback:
              'Xuất sắc! Bạn đã thực hiện đúng quy trình ứng phó an toàn: Dừng lại -> Bảo vệ OTP -> Báo cáo lừa đảo cho cơ quan chức năng.',
            competencyImpact: {
              threatIdentification: 100,
              safeResponse: 100,
              dataProtection: 100,
              criticalThinking: 100,
              digitalCulture: 100,
            },
          },
        ],
      },
    ],
    learningTakeaways: [
      'Không bao giờ chia sẻ mã xác thực OTP, mật khẩu tài khoản cho bất kỳ ai, kể cả nhân viên tự xưng tổng đài.',
      'Kiểm tra kỹ tên miền (domain): Các trang web chính thống tại Việt Nam thường có đuôi .vn, .com.vn hoặc được Bộ Công Thương chứng nhận.',
      'Nguyên tắc cảnh giác: Không có phần thưởng đắt tiền nào "từ trên trời rơi xuống" nếu không tham gia chương trình chính thức.',
      'Cú pháp báo cáo tin nhắn lừa đảo tại Việt Nam: Gửi tin nhắn phản ánh tới đầu số 156 hoặc 5656 (miễn cước).',
    ],
    siftGuide: {
      stop: 'Dừng lại ngay khi thấy thông báo trúng thưởng gấp gáp yêu cầu làm trong vài phút.',
      investigate: 'Điều tra nguồn gửi: Kiểm tra số tổng đài thật của nhãn hàng, kiểm tra tên miền .xyz.',
      find: 'Tìm kiếm tin tức: Gõ Google xem cụm từ "lừa đảo trúng thưởng FPT iPhone" có ai đã cảnh báo chưa.',
      trace: 'Truy vết bản quyền: Vào thẳng website chính thức (fptshop.com.vn) xem mục Khuyến mãi có chương trình này không.',
    },
  },
  {
    id: 'scen_deepfake_2',
    title: 'Cuộc gọi Deepfake mượn tiền khẩn cấp từ "Người thân"',
    category: 'deepfake',
    difficulty: 'nang_cao',
    description:
      'Học sinh nhận được cuộc gọi video Messenger từ tài khoản của người thân (anh chị đi học xa), mặt và giọng nói giống hệt nhưng hình ảnh giật giật, viện cớ tai nạn đòi chuyển tiền gấp vào STK lạ.',
    targetGrade: 'Khối 11, 12',
    createdByType: 'teacher',
    assignedClassIds: ['class_12a1', 'class_12a2'],
    senderInfo: {
      name: 'Anh Hai (Đang học Đại học tại TP.HCM)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      handleOrNumber: 'fb.com/anhhai.nguyenduc',
      platform: 'Messenger',
      verifiedBadge: false,
    },
    context:
      'Lúc 14:30 trưa, bạn nhận được cuộc gọi video qua Messenger từ anh trai. Cuộc gọi diễn ra 5 giây: thấy mặt anh và giọng nói quen thuộc nói "Em ơi anh bị quẹt xe trên đường, gấp quá chuyển cho anh 2 triệu vào số tài khoản này ngay nhé" rồi video tắt phụt viện cớ mạng chập chờn.',
    stages: [
      {
        stageId: 1,
        timeAgo: 'Vừa xong',
        promptText:
          'Sau khi cuộc gọi video tắt, tin nhắn Messenger gửi đến số tài khoản: "987654321 - NGUYEN VAN HUNG - Ngan hang VCB. Chuyển gấp giúp anh, người ta đang giữ xe anh!". Trong khi anh trai bạn họ Trần tên Nam, số tài khoản lại tên người khác.',
        redFlags: [
          {
            id: 'rf_video_glitch',
            label: 'Video chập chờn, cử động môi gượng gạo',
            explanation: 'Dấu hiệu điển hình của công nghệ Deepfake AI: video khuôn mặt thường bị đơ mắt, nhấp nháy, cử động miệng không khớp tự nhiên và cuộc gọi thường bị ngắt rất nhanh dưới 10 giây.',
          },
          {
            id: 'rf_different_bank_name',
            label: 'Chủ tài khoản ngân hàng không phải tên người thân',
            explanation: 'Kẻ gian thường mua hoặc thuê tài khoản "rác" đứng tên người lạ để nhận tiền lừa đảo nhằm trốn tránh truy vết.',
          },
          {
            id: 'rf_emergency_pressure',
            label: 'Tạo tình huống tai nạn để gây hoảng loạn',
            explanation: 'Đánh vào tâm lý lo lắng cho người thân để nạn nhân mất khả năng phán đoán logic và chuyển tiền vội vã.',
          },
        ],
        choices: [
          {
            id: 'c1_transfer_fast',
            text: 'Chuyển tiền ngay lập tức vì vừa nhìn thấy mặt anh trai trên video nên chắc chắn là thật',
            isSafeAction: false,
            score: 0,
            aiMentorFeedback:
              'Bẫy lừa Deepfake nguy hiểm! Với AI hiện nay, kẻ xấu chỉ cần vài bức ảnh và mẫu giọng nói 5 giây là có thể giả mạo video khuôn mặt.',
            competencyImpact: {
              threatIdentification: 0,
              safeResponse: 0,
              dataProtection: 20,
              criticalThinking: 0,
              digitalCulture: 20,
            },
          },
          {
            id: 'c2_call_direct_sim',
            text: 'Không chuyển tiền, ngắt Messenger và bấm gọi điện thoại thường (SIM) trực tiếp cho anh trai hoặc hỏi bố mẹ',
            isSafeAction: true,
            score: 100,
            aiMentorFeedback:
              'Phản xạ tuyệt vời! Kênh viễn thông truyền thống (gọi số di động SIM) giúp xác thực trực tiếp và phá vỡ âm mưu chiếm đoạt tài khoản mạng xã hội.',
            competencyImpact: {
              threatIdentification: 100,
              safeResponse: 100,
              dataProtection: 95,
              criticalThinking: 100,
              digitalCulture: 90,
            },
          },
          {
            id: 'c3_ask_secret_question',
            text: 'Hỏi lại trong tin nhắn Messenger một câu hỏi bí mật mà chỉ hai anh em biết (ví dụ: con mèo nhà mình tên gì)',
            isSafeAction: true,
            score: 85,
            aiMentorFeedback:
              'Cách xử lý rất thông minh! Đặt "mã mật khẩu gia đình" hoặc câu hỏi đời tư giúp kiểm tra xem người đang chat có thực sự là người thân hay không.',
            competencyImpact: {
              threatIdentification: 85,
              safeResponse: 85,
              dataProtection: 80,
              criticalThinking: 95,
              digitalCulture: 85,
            },
          },
        ],
      },
    ],
    learningTakeaways: [
      'Công nghệ Deepfake AI có thể giả mạo khuôn mặt và giọng nói với độ chân thực cao, nhưng thường có tật như nháy mắt bất thường, viền mặt mờ, ngắt máy nhanh.',
      'Quy tắc vàng khi mượn tiền khẩn cấp: Luôn gọi điện trực tiếp bằng số SIM di động để xác nhận lại, không dựa vào cuộc gọi mạng xã hội.',
      'Thiết lập "mật khẩu an toàn gia đình" (Safe Word): Thỏa thuận từ trước một từ khóa hoặc câu hỏi mà chỉ thành viên trong nhà biết để dùng khi khẩn cấp.',
      'Cảnh giác với số tài khoản ngân hàng lạ khác tên người thân.',
    ],
    siftGuide: {
      stop: 'Dừng ngay trước yêu cầu chuyển tiền gấp vì lý do tai nạn/cấp cứu.',
      investigate: 'Điều tra chủ tài khoản ngân hàng và kiểm tra biểu cảm bất thường trên video.',
      find: 'Tìm kiếm kênh liên lạc thay thế: Gọi trực tiếp số điện thoại SIM di động.',
      trace: 'Truy vết nguồn gốc: Hỏi người thân khác trong gia đình xem có ai đang liên lạc với anh trai không.',
    },
  },
  {
    id: 'scen_fakenews_3',
    title: 'Tin giả "Lộ đề thi Tốt nghiệp THPT 2025" & Phát tán mã độc',
    category: 'fake_news',
    difficulty: 'trung_binh',
    description:
      'Trên mạng xã hội xuất hiện bài viết giật gân tuyên bố có file đề thi mật môn Tin học/Toán kỳ thi Tốt nghiệp THPT, thúc giục học sinh tải file đuôi .zip/.exe và chia sẻ vào các nhóm học tập.',
    targetGrade: 'Khối 12',
    createdByType: 'teacher',
    assignedClassIds: ['class_12a1', 'class_12a2'],
    senderInfo: {
      name: 'Diễn Đàn 2k7 Ôn Thi Đại Học Số 1 VN',
      avatar: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=120&auto=format&fit=crop&q=80',
      handleOrNumber: '@onthithpt2k7_hotnews',
      platform: 'Facebook',
      verifiedBadge: false,
    },
    context:
      'Trong thời gian ôn thi nước rút, một fanpage đăng bài kèm hình ảnh chụp mờ tiêu đề có dấu mật của Bộ Giáo dục & Đào tạo, thu hút hàng nghìn lượt tương tác của học sinh cả nước.',
    stages: [
      {
        stageId: 1,
        timeAgo: '1 giờ trước',
        promptText:
          'NỘI DUNG BÀI ĐĂNG: "Sốc! Lộ trọn bộ đề thi và đáp án chính thức môn Tin học - Toán THPT 2025. Bộ GD&ĐT chưa kịp thu hồi. Các em tải file de_thi_chinh_thuc.zip.exe tại link: bit.ly/de-thi-mat-2025. Hãy share bài viết này vào 5 nhóm học tập để nhận mật khẩu giải nén!".',
        redFlags: [
          {
            id: 'rf_double_extension',
            label: 'Đuôi file kép nguy hiểm .zip.exe',
            explanation: 'File tài liệu học tập chuẩn là file PDF hoặc Word (.docx). Đuôi kép .zip.exe thực chất là chương trình mã độc (Trojan) ngụy trang.',
          },
          {
            id: 'rf_fake_authority',
            label: 'Mạo danh tài liệu mật của Bộ GD&ĐT',
            explanation: 'Đề thi THPT thuộc danh mục Bí mật Nhà nước độ Tối mật, được bảo vệ nghiêm ngặt bằng quy trình in sao cách ly 3 vòng, không thể có chuyện "lộ tải công khai".',
          },
          {
            id: 'rf_forced_sharing',
            label: 'Bắt buộc chia sẻ vào 5 nhóm',
            explanation: 'Chiêu thức khuếch tán tin giả và biến học sinh thành công cụ lan truyền nội dung độc hại trên mạng xã hội.',
          },
        ],
        choices: [
          {
            id: 'c1_download_share',
            text: 'Tải file ngay về máy tính và chia sẻ nhanh vào nhóm lớp 12A1 để cả lớp cùng ôn',
            isSafeAction: false,
            score: 0,
            aiMentorFeedback:
              'Hậu quả khôn lường! Máy tính của bạn sẽ bị nhiễm mã độc tống tiền (Ransomware) hoặc virus đánh cắp mật khẩu Facebook, đồng thời hành vi chia sẻ tin giả có thể bị xử phạt theo Nghị định 15/2020/NĐ-CP.',
            competencyImpact: {
              threatIdentification: 0,
              safeResponse: 0,
              dataProtection: 0,
              criticalThinking: 0,
              digitalCulture: 0,
            },
          },
          {
            id: 'c2_fact_check_sift',
            text: 'Kiểm chứng thông tin trên Cổng thông tin điện tử chính thức của Bộ GD&ĐT (moet.gov.vn) hoặc Báo Giáo dục & Thời đại',
            isSafeAction: true,
            score: 100,
            aiMentorFeedback:
              'Tư duy phản biện xuất sắc! Áp dụng kỹ năng SIFT để kiểm chứng nguồn tin chính thống từ Bộ GD&ĐT giúp bạn không bị dắt mũi bởi tin giả giật gân.',
            competencyImpact: {
              threatIdentification: 100,
              safeResponse: 100,
              dataProtection: 95,
              criticalThinking: 100,
              digitalCulture: 100,
            },
          },
          {
            id: 'c3_report_post',
            text: 'Bấm Báo cáo (Report) bài viết tin giả cho Facebook và bình luận cảnh báo các bạn khác đừng tải file độc',
            isSafeAction: true,
            score: 95,
            aiMentorFeedback:
              'Hành động trách nhiệm vì cộng đồng số! Lan tỏa văn hóa phản biện và bảo vệ các bạn học sinh khác trước nguy cơ mất an toàn mạng.',
            competencyImpact: {
              threatIdentification: 90,
              safeResponse: 95,
              dataProtection: 90,
              criticalThinking: 95,
              digitalCulture: 100,
            },
          },
        ],
      },
    ],
    learningTakeaways: [
      'Đề thi quốc gia được bảo mật tuyệt đối, mọi thông tin "lộ đề thi" trên mạng 100% là tin giả hoặc chiêu trò lừa đảo câu view phát tán mã độc.',
      'Cảnh giác với định dạng tệp tin: Không bao giờ mở các file có đuôi .exe, .scr, .bat khi tải về từ mạng xã hội.',
      'Tuân thủ pháp luật: Hành vi đăng tải, lan truyền thông tin sai sự thật trên không gian mạng có thể bị phạt hành chính từ 5 - 10 triệu đồng (Nghị định 15/2020/NĐ-CP).',
      'Mô hình kiểm chứng tin tức SIFT: Dừng lại (Stop) -> Điều tra nguồn (Investigate) -> Tìm nguồn tin tốt hơn (Find) -> Lần về ngữ cảnh gốc (Trace).',
    ],
    siftGuide: {
      stop: 'Dừng ngay ham muốn click tải và tuyệt đối không chia sẻ bài viết giật gân.',
      investigate: 'Điều tra trang đăng tin: Xem đây là fanpage tự phát hay kênh chính thống của cơ quan giáo dục.',
      find: 'Tìm kiếm trên báo chí chính thống: Xem Thông tấn xã Việt Nam, Báo Nhân Dân, Báo Tuổi Trẻ có đăng tin này không.',
      trace: 'Lần về văn bản gốc trên website moet.gov.vn.',
    },
  },
  {
    id: 'scen_job_scam_4',
    title: 'Tuyển CTV gõ văn bản / tương tác TikTok 500k/ngày - Bẫy nạp tiền nhiệm vụ',
    category: 'phishing',
    difficulty: 'trung_binh',
    description:
      'Chiêu bài tuyển dụng học sinh làm thêm tại nhà với mức thù lao hấp dẫn không cần kinh nghiệm, sau đó dẫn dụ vào nhóm Telegram và yêu cầu nạp tiền "thế chân" hoặc "nhiệm vụ tài chính".',
    targetGrade: 'Khối 10, 11, 12',
    createdByType: 'teacher',
    assignedClassIds: ['class_12a1', 'class_12a2'],
    senderInfo: {
      name: 'Tuyển Dụng Việc Làm Thêm Học Sinh THPT',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
      handleOrNumber: 't.me/vieclam_online_thpt',
      platform: 'TikTok',
      verifiedBadge: false,
    },
    context:
      'Một học sinh lướt TikTok thấy video tuyển việc làm thêm tại nhà: "Chỉ cần điện thoại, mỗi ngày 1 tiếng xem video kiếm 300.000đ - 500.000đ, phù hợp học sinh kiếm tiền tiêu vặt".',
    stages: [
      {
        stageId: 1,
        timeAgo: 'Hôm nay',
        promptText:
          'Sau khi bạn nhắn tin, người hướng dẫn đưa bạn vào nhóm Telegram 200 thành viên, yêu cầu làm thử nhiệm vụ 1 (thả tim 3 video) và lập tức chuyển cho bạn 20.000đ tiền thưởng thật để tạo lòng tin. Đến nhiệm vụ 2, họ yêu cầu bạn chuyển 200.000đ vào tài khoản chỉ định để "nhận đơn hàng hoàn tiền 260.000đ (lãi 30%)". Bạn làm gì?',
        redFlags: [
          {
            id: 'rf_small_bait',
            label: 'Chiêu thả con săn sắt bắt con cá rô',
            explanation: 'Kẻ lừa đảo sẵn sàng trả 20k - 50k đầu tiên để nạn nhân tin rằng công việc có thật, sau đó mới dụ nạp số tiền lớn dần.',
          },
          {
            id: 'rf_pay_to_work',
            label: 'Việc làm chân chính không bao giờ bắt nạp tiền trước',
            explanation: 'Nguyên tắc bất biến: Đi làm là để nhận lương, bất kỳ công việc nào bắt người lao động phải nộp tiền cọc/tiền nhiệm vụ đều là lừa đảo.',
          },
          {
            id: 'rf_fake_crowd',
            label: 'Nhóm Telegram đông người nhưng đa số là tài khoản "chim mồi"',
            explanation: 'Các tài khoản liên tục khoe nhận được tiền trong nhóm thực chất đều là đồng bọn hoặc bot tự động nhằm tạo hiệu ứng tâm lý đám đông.',
          },
        ],
        choices: [
          {
            id: 'c1_deposit_money',
            text: 'Nạp 200.000đ vì nghĩ vừa nhận được 20.000đ thật và muốn kiếm thêm tiền tiêu vặt',
            isSafeAction: false,
            score: 0,
            aiMentorFeedback:
              'Rơi vào bẫy! Sau 200k, họ sẽ viện lý do "lỗi cú pháp", "nhiệm vụ liên hoàn" ép bạn nạp tiếp 1 triệu, 5 triệu, 20 triệu và không bao giờ cho rút tiền.',
            competencyImpact: {
              threatIdentification: 0,
              safeResponse: 0,
              dataProtection: 20,
              criticalThinking: 0,
              digitalCulture: 30,
            },
          },
          {
            id: 'c2_stop_and_exit',
            text: 'Nhận diện ngay bẫy lừa cọc nhiệm vụ, dừng lại ngay lập tức, thoát nhóm Telegram và chặn liên lạc',
            isSafeAction: true,
            score: 100,
            aiMentorFeedback:
              'Phản xạ tuyệt vời! Bạn đã nắm vững nguyên lý: "Việc nhẹ lương cao bắt nạp tiền = 100% Lừa đảo".',
            competencyImpact: {
              threatIdentification: 100,
              safeResponse: 100,
              dataProtection: 95,
              criticalThinking: 100,
              digitalCulture: 95,
            },
          },
        ],
      },
    ],
    learningTakeaways: [
      'Không có công việc nào "việc nhẹ lương cao" chỉ bấm like thả tim mà kiếm tiền triệu mỗi ngày.',
      'Tuyệt đối không nạp tiền đặt cọc, nạp tiền mua nhiệm vụ, nạp tiền mở khóa tài khoản.',
      'Cảnh giác với các nhóm chat Telegram, Zalo có đông thành viên khoe tiền vì đó là các tài khoản chim mồi dẫn dụ.',
    ],
    siftGuide: {
      stop: 'Dừng lại ngay khi bị yêu cầu chuyển tiền nạp nhiệm vụ.',
      investigate: 'Điều tra công ty tuyển dụng: Có mã số thuế, địa chỉ trụ sở rõ ràng không.',
      find: 'Tìm kiếm thông tin: Tra cứu trên Google "lừa đảo làm nhiệm vụ Telegram Shopee TikTok".',
      trace: 'Lần theo dấu vết: Kiểm tra dòng tiền và cảnh báo từ Bộ Công an về bẫy việc làm online.',
    },
  },
  {
    id: 'scen_cyberbullying_5',
    title: 'Phòng chống Bạo lực mạng & Bảo vệ Dữ liệu Riêng tư Cá nhân',
    category: 'cyberbullying',
    difficulty: 'co_ban',
    description:
      'Trong nhóm kín học sinh, xuất hiện bài đăng công kích bôi nhọ một bạn cùng trường, kèm lời kêu gọi "ném đá" và chia sẻ thông tin cá nhân (doxxing). Kỹ năng ứng phó văn hóa mạng có trách nhiệm.',
    targetGrade: 'Khối 10, 11, 12',
    createdByType: 'teacher',
    assignedClassIds: ['class_12a1', 'class_12a2'],
    senderInfo: {
      name: 'Nhóm Confession Góc Khuất Học Đường',
      avatar: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=120&auto=format&fit=crop&q=80',
      handleOrNumber: 'Group Kín 5.000 Thành Viên',
      platform: 'Facebook',
      verifiedBadge: false,
    },
    context:
      'Bạn lướt thấy một bài đăng ẩn danh bêu riếu bạn cùng lớp, đăng kèm ảnh chụp trộm và số điện thoại của bạn ấy, kêu gọi mọi người vào nhắn tin xúc phạm.',
    stages: [
      {
        stageId: 1,
        timeAgo: '30 phút trước',
        promptText:
          'Một số bạn đang hùa vào thả icon cười cợt và bình luận xúc phạm nặng nề. Bạn của bạn đang rất hoảng loạn và khóc trong lớp. Là một công dân số có trách nhiệm, bạn hành động như thế nào?',
        redFlags: [
          {
            id: 'rf_cyberbullying',
            label: 'Hành vi Bạo lực mạng (Cyberbullying)',
            explanation: 'Sử dụng không gian mạng để quấy rối, đe dọa, xúc phạm danh dự nhân phẩm người khác gây tổn thương tâm lý nghiêm trọng.',
          },
          {
            id: 'rf_doxxing',
            label: 'Hành vi Doxxing (Lộ dữ liệu cá nhân trái phép)',
            explanation: 'Công khai thông tin cá nhân (ảnh riêng tư, số điện thoại, địa chỉ) khi chưa được phép là vi phạm quyền riêng tư và Luật An ninh mạng.',
          },
        ],
        choices: [
          {
            id: 'c1_join_or_ignore',
            text: 'Thả like hoặc chia sẻ bài viết vì nghĩ đây chỉ là chuyện trêu đùa vui trên mạng',
            isSafeAction: false,
            score: 0,
            aiMentorFeedback:
              'Hành vi tiếp tay cho bắt nạt mạng! Like và chia sẻ nội dung công kích người khác khiến nạn nhân chịu tổn thương tâm lý sâu sắc và vi phạm đạo đức học đường.',
            competencyImpact: {
              threatIdentification: 20,
              safeResponse: 0,
              dataProtection: 0,
              criticalThinking: 0,
              digitalCulture: 0,
            },
          },
          {
            id: 'c2_support_and_report',
            text: 'Lưu ảnh màn hình làm bằng chứng, an ủi động viên bạn, báo cáo cho Giáo viên chủ nhiệm / Đoàn trường và Report bài viết',
            isSafeAction: true,
            score: 100,
            aiMentorFeedback:
              'Rất nhân văn và mẫu mực! Bạn là tấm gương tiêu biểu của Văn hóa số có trách nhiệm: bảo vệ bạn bè, ngăn chặn bắt nạt mạng và xử lý đúng quy trình sư phạm.',
            competencyImpact: {
              threatIdentification: 100,
              safeResponse: 100,
              dataProtection: 100,
              criticalThinking: 95,
              digitalCulture: 100,
            },
          },
        ],
      },
    ],
    learningTakeaways: [
      'Không tham gia bình luận xúc phạm, không chia sẻ hình ảnh hoặc thông tin cá nhân của người khác khi chưa có sự đồng ý.',
      'Khi chứng kiến bạo lực mạng: Hãy là "Người can thiệp tích cực" (Upstander) thay vì là "Người ngoài cuộc bàng quan" (Bystander).',
      'Lưu lại bằng chứng (chụp ảnh màn hình có timestamp, URL bài đăng) để báo cáo kịp thời cho gia đình và nhà trường.',
    ],
    siftGuide: {
      stop: 'Dừng tay, không a dua thả like hoặc chia sẻ nội dung bôi nhọ.',
      investigate: 'Xem xét hậu quả tâm lý và pháp lý đối với người bị công kích.',
      find: 'Tìm kiếm sự hỗ trợ từ thầy cô, ban giám hiệu hoặc phòng tư vấn tâm lý học đường.',
      trace: 'Lưu vết bằng chứng để xử lý theo quy định của nhà trường và pháp luật.',
    },
  },
];

export const INITIAL_SAFENET_ATTEMPTS: SafeNetStudentAttempt[] = [
  {
    id: 'att_1',
    scenarioId: 'scen_phishing_1',
    scenarioTitle: 'Tin nhắn trúng thưởng iPhone 16 Pro Max & Đòi mã OTP',
    category: 'phishing',
    studentId: 'user_student_1',
    studentName: 'Trần Thị Mai Anh',
    className: '12A1',
    completedAt: '2025-05-18 10:15',
    totalScore: 98,
    decisionPath: [
      {
        stageId: 1,
        choiceId: 'c2_verify_official',
        choiceText: 'Không nhấp vào link, kiểm tra lại số điện thoại và tra cứu trên trang web chính thức',
        isSafe: true,
      },
      {
        stageId: 2,
        choiceId: 'c2_close_and_report',
        choiceText: 'Lập tức đóng tab, chụp ảnh màn hình làm bằng chứng cảnh báo cho bạn bè và báo cáo tin nhắn rác',
        isSafe: true,
      },
    ],
    identifiedRedFlagIds: ['rf_domain', 'rf_urgency', 'rf_otp_sharing'],
    aiEvaluationSummary:
      'Học sinh Mai Anh thể hiện tư duy cảnh giác số xuất sắc. Nhận diện chính xác tên miền giả mạo .xyz và kiên quyết từ chối cung cấp mã OTP.',
    aiStrengths: [
      'Phản xạ dừng lại (STOP) trước kích thích tâm lý trúng thưởng',
      'Nhận diện tốt chiêu trò giả mạo tên miền',
      'Ý thức bảo vệ mã OTP tuyệt đối',
    ],
    aiAreasToImprove: ['Nên chủ động bấm báo cáo tin nhắn rác tới đầu số 156 nhanh hơn.'],
    competencies: {
      threatIdentification: 98,
      safeResponse: 96,
      dataProtection: 100,
      criticalThinking: 95,
      digitalCulture: 94,
    },
    earnedBadge: 'Lá chắn Vàng An toàn số',
  },
  {
    id: 'att_2',
    scenarioId: 'scen_deepfake_2',
    scenarioTitle: 'Cuộc gọi Deepfake mượn tiền khẩn cấp từ "Người thân"',
    category: 'deepfake',
    studentId: 'user_student_2',
    studentName: 'Lê Hoàng Nam',
    className: '12A1',
    completedAt: '2025-05-18 14:20',
    totalScore: 95,
    decisionPath: [
      {
        stageId: 1,
        choiceId: 'c2_call_direct_sim',
        choiceText: 'Không chuyển tiền, ngắt Messenger và bấm gọi điện thoại thường (SIM) trực tiếp cho anh trai',
        isSafe: true,
      },
    ],
    identifiedRedFlagIds: ['rf_video_glitch', 'rf_different_bank_name', 'rf_emergency_pressure'],
    aiEvaluationSummary:
      'Học sinh Hoàng Nam xử lý rất linh hoạt và thông minh: phát hiện sự bất thường giữa tên người thân và tên tài khoản ngân hàng, chọn kênh xác minh điện thoại SIM thay vì tin lời video call.',
    aiStrengths: [
      'Hiểu rõ công nghệ Deepfake AI',
      'Kiểm chứng chéo qua kênh viễn thông SIM',
      'Không để cảm xúc hoảng loạn chi phối quyết định tài chính',
    ],
    aiAreasToImprove: ['Nên thảo luận với gia đình để thống nhất một từ khóa Safe Word khẩn cấp.'],
    competencies: {
      threatIdentification: 96,
      safeResponse: 95,
      dataProtection: 92,
      criticalThinking: 98,
      digitalCulture: 90,
    },
    earnedBadge: 'Chuyên gia Phá bẫy Deepfake',
  },
  {
    id: 'att_3',
    scenarioId: 'scen_fakenews_3',
    scenarioTitle: 'Tin giả "Lộ đề thi Tốt nghiệp THPT 2025" & Phát tán mã độc',
    category: 'fake_news',
    studentId: 'user_student_3',
    studentName: 'Phạm Thảo Vy',
    className: '12A2',
    completedAt: '2025-05-18 16:45',
    totalScore: 92,
    decisionPath: [
      {
        stageId: 1,
        choiceId: 'c2_fact_check_sift',
        choiceText: 'Kiểm chứng thông tin trên Cổng thông tin điện tử chính thức của Bộ GD&ĐT (moet.gov.vn)',
        isSafe: true,
      },
    ],
    identifiedRedFlagIds: ['rf_double_extension', 'rf_fake_authority'],
    aiEvaluationSummary:
      'Học sinh Thảo Vy áp dụng tốt phương pháp kiểm chứng tin tức SIFT, nhận biết được tính bảo mật của kỳ thi quốc gia và kiên quyết không lan truyền tin đồn thất thiệt.',
    aiStrengths: [
      'Nắm vững phương pháp SIFT xác minh tin tức',
      'Cảnh giác với định dạng tệp tin kép nguy hiểm (.zip.exe)',
      'Tuân thủ đạo đức mạng xã hội',
    ],
    aiAreasToImprove: ['Cần kết hợp bấm tính năng Báo cáo (Report) bài viết vi phạm cho nền tảng mạng xã hội.'],
    competencies: {
      threatIdentification: 90,
      safeResponse: 92,
      dataProtection: 90,
      criticalThinking: 95,
      digitalCulture: 96,
    },
    earnedBadge: 'Dũng sĩ Bác bỏ Tin giả',
  },
];

export const INITIAL_SAFENET_CHALLENGES: SafeNetChallenge[] = [
  {
    id: 'chal_1',
    title: 'Thử thách Tháng 5: Nhận diện Lừa đảo Trực tuyến & Deepfake AI',
    scenarioId: 'scen_phishing_1',
    teacherId: 'user_teacher_1',
    teacherName: 'Cô Trần Thị Tuyết Nhung',
    classId: 'class_12a1',
    className: '12A1',
    dueDate: '2025-05-25 23:59',
    status: 'active',
    targetPassingScore: 80,
  },
  {
    id: 'chal_2',
    title: 'Thử thách: Kỹ năng SIFT - Kiểm chứng Tin tức Kỳ thi THPT 2025',
    scenarioId: 'scen_fakenews_3',
    teacherId: 'user_teacher_1',
    teacherName: 'Cô Trần Thị Tuyết Nhung',
    classId: 'class_12a2',
    className: '12A2',
    dueDate: '2025-05-28 23:59',
    status: 'active',
    targetPassingScore: 80,
  },
];
