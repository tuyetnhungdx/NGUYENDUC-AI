import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

import multer from 'multer';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '10mb' }));

// Set up persistent local uploads directory
const UPLOADS_DIR = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}_${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max limit
});

// Serve uploaded files statically
app.use('/api/files', express.static(UPLOADS_DIR));

// Endpoint upload file thực tế
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Không tìm thấy tệp đính kèm' });
  }

  const fileUrl = `/api/files/${encodeURIComponent(req.file.filename)}`;
  res.json({
    success: true,
    fileId: `file_${Date.now()}`,
    fileName: req.file.originalname,
    storedFilename: req.file.filename,
    fileSize: req.file.size,
    fileType: path.extname(req.file.originalname).replace('.', '').toLowerCase(),
    filePath: req.file.path,
    fileUrl,
  });
});

// Initialize GoogleGenAI client according to skill instructions
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Health check & AI status
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(apiKey),
    model: 'gemini-3.8-flash',
    timestamp: new Date().toISOString(),
  });
});

// 2. Submission Diagnostic - Model AI 4C (C1 & C2)
app.post('/api/ai/diagnose-submission', async (req, res) => {
  const { htmlCode, assignmentTitle, rubricItems, versionNumber } = req.body;

  if (!htmlCode) {
    return res.status(400).json({ error: 'Mã HTML không được để trống' });
  }

  // Pre-analysis: Rule-based static check for HTML
  const staticIssues: Array<{
    type: string;
    line?: number;
    message: string;
    priority: 'high' | 'medium' | 'low';
  }> = [];

  const codeLines = (htmlCode as string).split('\n');

  // Check doctype
  if (!htmlCode.toLowerCase().includes('<!doctype html>')) {
    staticIssues.push({
      type: 'structure',
      line: 1,
      message: 'Thiếu khai báo chuẩn <!DOCTYPE html> ở đầu tài liệu.',
      priority: 'medium',
    });
  }

  // Check table tags pairing
  const tableOpen = (htmlCode.match(/<table\b/gi) || []).length;
  const tableClose = (htmlCode.match(/<\/table>/gi) || []).length;
  if (tableOpen !== tableClose) {
    staticIssues.push({
      type: 'table',
      message: `Thẻ <table> chưa đóng đúng cách (${tableOpen} mở, ${tableClose} đóng).`,
      priority: 'high',
    });
  }

  // Check tr / td inside table
  const trOpen = (htmlCode.match(/<tr\b/gi) || []).length;
  const trClose = (htmlCode.match(/<\/tr>/gi) || []).length;
  if (trOpen !== trClose) {
    staticIssues.push({
      type: 'table',
      message: `Cấu trúc hàng <tr> chưa đóng đủ (${trOpen} mở, ${trClose} đóng).`,
      priority: 'high',
    });
  }

  // Check ul / ol
  const hasUl = /<ul\b/i.test(htmlCode);
  const hasOl = /<ol\b/i.test(htmlCode);
  if (!hasUl && !hasOl) {
    staticIssues.push({
      type: 'list',
      message: 'Chưa phát hiện danh sách (chưa có thẻ <ul> hoặc <ol>).',
      priority: 'high',
    });
  } else if (!hasOl) {
    staticIssues.push({
      type: 'list',
      message: 'Bài yêu cầu cả danh sách có thứ tự (<ol>) nhưng chưa tìm thấy thẻ <ol>.',
      priority: 'medium',
    });
  }

  // If Gemini API is available, ask Gemini 3.8 Flash for pedagogical 4C analysis
  if (ai) {
    try {
      const prompt = `
Bạn là Trợ lý AI Đánh giá Bài tập (AI Assignment Reviewer) cho học sinh THPT Việt Nam (Môn Tin học 12).
Triết lý giáo dục: "AI không làm thay – AI giúp học sinh tự làm tốt hơn."
Mô hình AI 4C:
- C1: Chẩn đoán (Phát hiện lỗi, chỉ ra phần đã đạt & chưa đạt)
- C2: Chỉ dẫn (3 mức gợi ý từ nhận diện lỗi -> gợi ý kiến thức -> câu hỏi tư duy)

Nhiệm vụ của bài nộp: "${assignmentTitle || 'Bài thực hành HTML'}"
Tiêu chí đánh giá (Rubric):
${JSON.stringify(rubricItems || [])}

Mã HTML bài làm của học sinh (Lần nộp ${versionNumber || 1}):
\`\`\`html
${htmlCode}
\`\`\`

Yêu cầu xuất ra định dạng JSON duy nhất tuân thủ cấu trúc sau:
{
  "summary": "Tóm tắt đánh giá ngắn gọn, khích lệ tinh thần học sinh",
  "scoreEstimate": 7.5,
  "passedCriteria": ["Những yêu cầu rubric mà học sinh đã làm tốt"],
  "improvedCriteria": ["Những yêu cầu rubric cần cải thiện"],
  "issues": [
    {
      "element": "Thẻ hoặc phần tử bị lỗi (ví dụ: table, ol, tr)",
      "line": 15,
      "priority": "high" | "medium" | "low",
      "level1Hint": "Gợi ý mức 1: Nhận diện lỗi (chỉ ra vị trí và hiện tượng mà không giải hộ)",
      "level2Hint": "Gợi ý mức 2: Gợi ý kiến thức (nhắc lại cú pháp thẻ, lý thuyết)",
      "level3Hint": "Gợi ý mức 3: Hướng dẫn sâu hơn bằng ví dụ tương đương và đặt câu hỏi để học sinh tự sửa"
    }
  ],
  "rubricResults": [
    {
      "criteria": "Tên tiêu chí",
      "status": "passed" | "partial" | "failed",
      "comment": "Nhận xét cụ thể"
    }
  ],
  "pedagogicalPraise": "Lời khen cụ thể về phần học sinh đã tự hoàn thành tốt"
}

LƯU Ý QUAN TRỌNG:
1. Không đưa ra đoạn mã hoàn chỉnh để học sinh chép.
2. Dùng lời văn ân cần, chuẩn mực sư phạm THPT Việt Nam.
3. Chỉ trả về JSON hợp lệ, không bọc markdown hay giải thích thêm ngoài JSON.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const responseText = response.text?.trim() || '{}';
      const parsedData = JSON.parse(responseText);

      return res.json({
        success: true,
        source: 'gemini-3.8-flash',
        staticIssues,
        analysis: parsedData,
      });
    } catch (err: any) {
      console.error('Gemini diagnostic error:', err);
      // Fallback to static pedagogical analysis if API fails
      return res.json({
        success: true,
        source: 'static-pedagogical-engine',
        staticIssues,
        analysis: generateFallbackAnalysis(staticIssues, rubricItems, htmlCode),
      });
    }
  } else {
    // No API key configured
    return res.json({
      success: true,
      source: 'static-pedagogical-engine',
      notice: 'Hệ thống đang chạy bộ phân tích sư phạm cục bộ (Chưa cấu hình GEMINI_API_KEY).',
      staticIssues,
      analysis: generateFallbackAnalysis(staticIssues, rubricItems, htmlCode),
    });
  }
});

// Helper for fallback analysis
function generateFallbackAnalysis(issues: any[], rubricItems: any[], htmlCode: string) {
  const hasTable = /<table\b/i.test(htmlCode);
  const hasUl = /<ul\b/i.test(htmlCode);
  const hasOl = /<ol\b/i.test(htmlCode);
  const hasHead = /<head\b/i.test(htmlCode);

  return {
    summary: 'Bài làm bước đầu đã nắm được cấu trúc cơ bản của trang web HTML. Tuy nhiên một số thẻ danh sách và bảng cần hoàn thiện để đạt chuẩn yêu cầu.',
    scoreEstimate: issues.length === 0 ? 9.0 : issues.length <= 2 ? 7.0 : 5.5,
    passedCriteria: [
      hasHead ? 'Khai báo cấu trúc tài liệu cơ bản (html, head, body)' : 'Cấu trúc tài liệu',
      hasUl ? 'Tạo danh sách không thứ tự (ul, li)' : 'Nội dung văn bản',
    ].filter(Boolean),
    improvedCriteria: [
      !hasOl ? 'Danh sách có thứ tự (ol, li)' : 'Tối ưu danh sách',
      issues.some(i => i.type === 'table') ? 'Cấu trúc đóng/mở thẻ bảng (table, tr, td)' : 'Định dạng bảng',
    ],
    issues: issues.map((iss, index) => ({
      element: iss.type,
      line: iss.line || (index * 4 + 8),
      priority: iss.priority,
      level1Hint: `Mức 1: Em hãy kiểm tra phần ${iss.message}`,
      level2Hint: `Mức 2: Nhớ lại quy tắc các thẻ lồng nhau trong HTML (ví dụ: thẻ mở phải có thẻ đóng tương ứng).`,
      level3Hint: `Mức 3: Thử kiểm tra xem từng thẻ <tr> đã chứa các thẻ <td> hoặc <th> chưa, và thẻ đóng </tr> đã nằm trước </table> chưa nhé?`,
    })),
    rubricResults: (rubricItems || [
      { name: 'Cấu trúc HTML' },
      { name: 'Danh sách không thứ tự' },
      { name: 'Danh sách có thứ tự' },
      { name: 'Cấu trúc bảng' },
      { name: 'Trình bày nội dung' },
    ]).map((r: any) => ({
      criteria: r.name || r.title || 'Tiêu chuẩn',
      status: (r.name && r.name.includes('bảng') && !hasTable) ? 'failed' : 'passed',
      comment: 'Đã hoàn thành cơ bản yêu cầu, hãy tiếp tục rà soát theo gợi ý 4C.',
    })),
    pedagogicalPraise: 'Em đã nỗ lực thiết kế trang web và sử dụng được nhiều thẻ định dạng HTML phong phú!',
  };
}

// 3. AI Learning Assistant (Student Socratic Tutor)
app.post('/api/ai/tutor-chat', async (req, res) => {
  const { message, history, context } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Nội dung tin nhắn không được rỗng' });
  }

  if (ai) {
    try {
      const systemInstruction = `
Bạn là "AI Learning Assistant" thuộc nền tảng NGUYỄN DỤC AI LEARNING HUB dành cho học sinh THPT Việt Nam (Trường THPT Nguyễn Dục).
Khẩu hiệu: "Học tập thông minh – Sáng tạo không giới hạn"
Thông điệp cốt lõi: "AI không làm thay – AI giúp học sinh tự làm tốt hơn."

NGUYÊN TẮC HOẠT ĐỘNG:
1. Đóng vai trò gia sư hỗ trợ học tập (Socratic Tutor).
2. TUYỆT ĐỐI KHÔNG giải hộ toàn bộ bài tập hoặc cung cấp mã nguồn hoàn chỉnh để học sinh chép.
3. Khi học sinh hỏi bài tập, hãy:
   - Bước 1: Hỏi lại học sinh để xác định em đã hiểu đến đâu.
   - Bước 2: Nhắc lại khái niệm lý thuyết cốt lõi (sách giáo khoa Tin học 11, 12 GDPT 2018).
   - Bước 3: Đưa ví dụ minh họa đơn giản tương tự nhưng khác với bài tập.
   - Bước 4: Đặt câu hỏi gợi ý để học sinh tự tìm ra đáp án.
4. Giọng điệu thân thiện, động viên, xưng "Thầy/Cô Trợ lý AI" hoặc "Trợ lý AI" và gọi học sinh là "em".
5. Ngữ cảnh lớp học hiện tại: ${JSON.stringify(context || { subject: 'Tin học 12', school: 'THPT Nguyễn Dục' })}.
`;

      const contents = [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nLịch sử hội thoại trước:\n${JSON.stringify(history || [])}\n\nCâu hỏi của học sinh: ${message}` }],
        },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          temperature: 0.7,
        },
      });

      return res.json({
        reply: response.text || 'Trợ lý AI đã ghi nhận câu hỏi của em. Em hãy kiểm tra lại yêu cầu bài tập nhé!',
        source: 'gemini-3.8-flash',
      });
    } catch (err: any) {
      console.error('Tutor chat error:', err);
      return res.json({
        reply: 'Chào em! Thầy/Cô Trợ lý AI gợi ý em hãy đọc lại phần cấu trúc thẻ trong SGK Tin học 12. Em có thể gửi đoạn mã đang băn khoăn để chúng ta cùng phân tích từng dòng nhé!',
        source: 'offline-fallback',
      });
    }
  } else {
    return res.json({
      reply: `Chào em! (Chế độ mô phỏng sư phạm THPT Nguyễn Dục): Đối với câu hỏi "${message}", em hãy nhớ lại nguyên tắc cấu trúc HTML: mỗi phần tử cần có thẻ mở và thẻ đóng tương ứng. Em hãy kiểm tra xem mình đang gặp khó khăn ở thẻ nào nhé!`,
      source: 'offline-rule-based',
    });
  }
});

// 4. AI Teacher Assistant (Lesson tasks, rubrics, class error synthesis)
app.post('/api/ai/teacher-assistant', async (req, res) => {
  const { action, topic, grade, submissionsData } = req.body;

  if (ai) {
    try {
      let prompt = '';
      if (action === 'create-rubric') {
        prompt = `
Bạn là Trợ lý AI dành riêng cho Giáo viên Tin học THPT Việt Nam (Chương trình GDPT 2018).
Hãy soạn thảo tiêu chí đánh giá (Rubric) chi tiết cho chủ đề: "${topic || 'Tạo danh sách và bảng trong HTML'}" - Khối ${grade || '12'}.
Xuất kết quả JSON với cấu trúc:
{
  "title": "Tên rubric",
  "criteria": [
    { "name": "Tiêu chí 1", "weight": "20%", "description": "Mô tả đạt chuẩn", "commonMistakes": "Lỗi học sinh hay gặp" },
    { "name": "Tiêu chí 2", "weight": "20%", "description": "...", "commonMistakes": "..." }
  ],
  "learningOutcomes": ["Yêu cầu cần đạt 1", "Yêu cầu cần đạt 2"],
  "pedagogicalAdvice": "Lời khuyên sư phạm cho giáo viên khi hướng dẫn thực hành"
}
`;
      } else if (action === 'analyze-errors') {
        prompt = `
Bạn là Chuyên gia phân tích dữ liệu sư phạm cho Giáo viên THPT.
Dữ liệu tóm tắt các bài nộp của học sinh lớp ${submissionsData?.className || '12A1'}:
${JSON.stringify(submissionsData || {})}

Hãy phân tích và đưa ra báo cáo tổng hợp JSON:
{
  "totalAnalyzed": 35,
  "topCommonErrors": [
    { "category": "Thẻ bảng (table)", "percentage": "42%", "description": "Quên đóng thẻ tr hoặc lồng td sai cấp độ", "solution": "Cho bài tập nhanh nhận diện lỗi trên bảng phụ" }
  ],
  "masteredTopics": ["Khai báo Doctype", "Tiêu đề h1-h6"],
  "remedialActionPlan": "Kế hoạch củng cố 15 phút đầu tiết tới",
  "differentiatedFeedback": "Gợi ý phân hóa học sinh theo 3 nhóm năng lực"
}
`;
      } else {
        prompt = `
Bạn là Trợ lý Giáo viên Tin học THPT. Hãy đề xuất 3 nhiệm vụ thực hành phân hóa cho chủ đề "${topic || 'HTML'}". Trả về JSON có mảng tasks gồm title, objective, difficulty, instructions.
`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      });

      return res.json({
        success: true,
        data: JSON.parse(response.text?.trim() || '{}'),
      });
    } catch (err: any) {
      console.error('Teacher assistant error:', err);
      return res.json({
        success: true,
        data: {
          title: `Rubric thực hành: ${topic}`,
          criteria: [
            { name: 'Cấu trúc thẻ cơ bản', weight: '20%', description: 'Đầy đủ doctype, html, head, body', commonMistakes: 'Quên đóng thẻ body' },
            { name: 'Danh sách ul/ol', weight: '25%', description: 'Lồng ghép li chính xác', commonMistakes: 'Viết li ngoài ul/ol' },
            { name: 'Bảng dữ liệu table', weight: '35%', description: 'Tổ chức bảng có tr, th, td rõ ràng', commonMistakes: 'Quên đóng thẻ tr' },
            { name: 'Thẩm mỹ và ngữ nghĩa', weight: '20%', description: 'Trình bày dễ nhìn, chuẩn tiếng Việt', commonMistakes: 'Lỗi gõ tiếng Việt có dấu' },
          ],
          learningOutcomes: ['Tạo được trang web có danh sách và bảng', 'Biết tự kiểm tra và sửa lỗi cú pháp'],
          pedagogicalAdvice: 'Tận dụng mô hình 4C để hướng dẫn học sinh sửa lỗi thay vì sửa trực tiếp cho học sinh.',
        },
      });
    }
  } else {
    // Offline template
    return res.json({
      success: true,
      notice: 'Chế độ mẫu sư phạm tích hợp sẵn.',
      data: {
        title: `Tiêu chí đánh giá chuẩn: ${topic || 'HTML & CSS'}`,
        criteria: [
          { name: 'Chuẩn cấu trúc HTML', weight: '25%', description: 'Đúng chuẩn W3C, cấu trúc ngữ nghĩa', commonMistakes: 'Thiếu DOCTYPE' },
          { name: 'Kỹ thuật Danh sách & Bảng', weight: '40%', description: 'Sử dụng thuần thục ul, ol, table, tr, th, td', commonMistakes: 'Lồng thẻ sai thứ tự' },
          { name: 'Nội dung và sáng tạo', weight: '20%', description: 'Nội dung phong phú, giới thiệu CLB ấn tượng', commonMistakes: 'Nội dung sơ sài' },
          { name: 'Khả năng tự hoàn thiện (4C)', weight: '15%', description: 'Biết xem chỉ dẫn AI và cải thiện phiên bản', commonMistakes: 'Không đọc chỉ dẫn AI' },
        ],
        learningOutcomes: ['Hiểu sâu cấu trúc DOM của bảng', 'Hình thành năng lực tự học và tư duy giải quyết vấn đề'],
        pedagogicalAdvice: 'Tổ chức cho học sinh báo cáo sự tiến bộ giữa Version 1 và Version 2.',
      },
    });
  }
});

// 5. Discussion Forum AI assistant
app.post('/api/ai/forum-assist', async (req, res) => {
  const { action, questionText, threadComments } = req.body;

  if (ai) {
    try {
      let prompt = '';
      if (action === 'refine-question') {
        prompt = `
Học sinh THPT hỏi câu hỏi sau trên diễn đàn lớp học: "${questionText}"
Hãy giúp học sinh hoàn thiện câu hỏi theo hướng:
1. Rõ ràng, cụ thể hơn về hiện tượng lỗi.
2. Đính kèm thông tin cần thiết (đoạn mã, lỗi hiển thị).
3. Đề xuất tiêu đề bài đăng hấp dẫn và lịch sự.
Trả về JSON: { "suggestedTitle": "...", "refinedContent": "...", "tips": "..." }
`;
      } else {
        prompt = `
Hãy tóm tắt ngắn gọn cuộc thảo luận diễn đàn sau thành 3 ý chính và kết luận bài học:
${JSON.stringify(threadComments || [])}
Trả về JSON: { "summaryPoints": ["..."], "keyTakeaway": "..." }
`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      return res.json({
        success: true,
        data: JSON.parse(response.text?.trim() || '{}'),
      });
    } catch (err) {
      return res.json({
        success: true,
        data: {
          suggestedTitle: `Thắc mắc về ${questionText.slice(0, 30)}...`,
          refinedContent: `Thầy/Cô và các bạn cho mình hỏi: Khi thực hiện bài thực hành, mình gặp hiện tượng sau: ${questionText}. Nhờ thầy cô và các bạn hướng dẫn mình cách khắc phục!`,
          tips: 'Nên ghi rõ số dòng hoặc chụp ảnh màn hình để mọi người hỗ trợ nhanh hơn.',
        },
      });
    }
  } else {
    return res.json({
      success: true,
      data: {
        suggestedTitle: `Hỏi về bài thực hành HTML: ${questionText.slice(0, 30)}`,
        refinedContent: `Em xin hỏi về vấn đề: ${questionText}. Em đã kiểm tra lại bài nhưng chưa rõ nguyên nhân. Em xin cảm ơn!`,
        tips: 'Hãy nêu cụ thể thẻ HTML mà em đang thực hiện.',
      },
    });
  }
});

// ==========================================
// SAFENET AI – LÁ CHẮN CÔNG DÂN SỐ API ENDPOINTS
// ==========================================

// 1. SafeNet Chat & Scenario Simulation (Scammer bot OR Cyber Guard Mentor)
app.post('/api/safenet/simulate-chat', async (req, res) => {
  const { scenarioId, scenarioTitle, targetRole, studentMessage, history, context } = req.body;

  if (!studentMessage) {
    return res.status(400).json({ error: 'Tin nhắn không được để trống' });
  }

  if (ai) {
    try {
      const systemInstruction =
        targetRole === 'scammer'
          ? `Bạn là một kịch bản giả lập kẻ lừa đảo qua mạng (Scammer AI) trong bối cảnh tình huống giáo dục THPT: "${scenarioTitle}". 
Bối cảnh: ${context || 'Kẻ gian đang cố gắng dụ dỗ học sinh cung cấp thông tin, mã OTP hoặc chuyển tiền/nạp cọc'}.
Mục tiêu giáo dục: Bạn phản hồi ngắn gọn (dưới 70 từ), tự nhiên như tin nhắn Zalo/Messenger/Telegram, dùng các chiêu thức thao túng như tạo cảm giác gấp gáp, đưa ra ưu đãi hấp dẫn, tỏ ra nhiệt tình hoặc dọa dẫm nhẹ.
KHÔNG thoát vai, KHÔNG nói bạn là AI trừ khi học sinh vạch trần được bẫy lừa một cách chuẩn xác thì thừa nhận bạn đã bị bắt bài và khen học sinh rất cảnh giác!`
          : `Bạn là SafeNet Cyber Mentor - Chuyên gia An toàn số của Trường THPT Nguyễn Dục.
Nhiệm vụ: Hướng dẫn học sinh THPT nhận diện rủi ro mạng, phân tích kỹ thuật lừa đảo, hướng dẫn áp dụng phương pháp SIFT (Stop, Investigate, Find, Trace) và khen ngợi phản xạ an toàn.
Lời khuyên phải mang tính sư phạm, gần gũi, khích lệ và chỉ dẫn cụ thể các bước bảo vệ thông tin cá nhân/tài khoản. Phản hồi dưới 120 từ.`;

      const contents: any[] = [];
      if (Array.isArray(history)) {
        for (const item of history.slice(-6)) {
          contents.push({
            role: item.role === 'model' || item.role === 'scammer' || item.role === 'mentor' ? 'model' : 'user',
            parts: [{ text: item.text || item.message || '' }],
          });
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: studentMessage }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      return res.json({
        success: true,
        reply: response.text?.trim() || 'Hệ thống đã ghi nhận tin nhắn của bạn.',
      });
    } catch (err: any) {
      console.error('SafeNet simulation error:', err);
    }
  }

  // Fallback if offline
  if (targetRole === 'scammer') {
    const isOTPQuery = studentMessage.toLowerCase().includes('otp') || studentMessage.toLowerCase().includes('mã');
    const isQuestioning = studentMessage.toLowerCase().includes('lừa') || studentMessage.toLowerCase().includes('sao') || studentMessage.toLowerCase().includes('thật không');
    
    let fallbackReply = 'Em yên tâm nhé, bên chị là tổng đài chăm sóc khách hàng uy tín liên kết với trường và nhà mạng. Em chỉ cần làm đúng hướng dẫn trong 5 phút là nhận máy ngay!';
    if (isOTPQuery) {
      fallbackReply = 'Mã OTP là mã đối soát quà tặng của hệ thống gửi về máy em đó, em đọc nhanh cho chị để hệ thống kịp xuất kho hàng iPhone nhé, còn 3 phút thôi!';
    } else if (isQuestioning) {
      fallbackReply = 'Sao em lại nghĩ chị lừa đảo? Chị có mã nhân viên đàng hoàng, nếu em không tin thì mất cơ hội nhận quà trị giá 35 triệu tiếc lắm em nhé!';
    }
    return res.json({ success: true, reply: fallbackReply });
  } else {
    return res.json({
      success: true,
      reply: 'Chào em! Thầy/cô Cyber Mentor khuyên em luôn nhớ quy tắc SIFT: Hãy DỪNG LẠI (Stop), không click link lạ và tuyệt đối không bao giờ cung cấp mã OTP hay chuyển tiền cho người lạ trên mạng nhé!',
    });
  }
});

// 2. SafeNet Analyze Threat / Fact-Check Tool
app.post('/api/safenet/analyze-threat', async (req, res) => {
  const { inputContent, contentType } = req.body;

  if (!inputContent) {
    return res.status(400).json({ error: 'Nội dung phân tích không được để trống' });
  }

  if (ai) {
    try {
      const prompt = `Bạn là Chuyên gia Đánh giá Mối đe dọa Số và An toàn Không gian mạng (Cyber Threat Intelligence) dành cho giáo dục học đường THPT.
Hãy phân tích nội dung sau:
Loại nội dung: ${contentType || 'Nội dung hỗn hợp (URL / Tin nhắn / Bài viết)'}
Nội dung: """${inputContent}"""

Yêu cầu trả về định dạng JSON thuần túy (không markdown bao quanh):
{
  "riskLevel": "Cao" | "Trung bình" | "Thấp" | "An toàn",
  "riskScore": số từ 0 đến 100 (100 là cực kỳ nguy hiểm),
  "threatCategory": "Lừa đảo chiếm đoạt tài sản" | "Tin giả / Thất thiệt" | "Đánh cắp danh tính / OTP" | "Mã độc ngụy trang" | "Bắt nạt trên mạng" | "Nội dung an toàn",
  "redFlags": ["danh sách 2-4 dấu hiệu nhận diện bất thường rõ ràng"],
  "psychologicalTricks": ["các đòn tâm lý kẻ xấu sử dụng, ví dụ: kích thích lòng tham, tạo cảm giác gấp gáp, mạo danh uy tín"],
  "siftRecommendations": {
    "stop": "Hành động dừng ngay lập tức",
    "investigate": "Cách kiểm tra nguồn gốc",
    "find": "Nguồn chính thống để đối chiếu",
    "trace": "Cách báo cáo và truy vết"
  },
  "actionableSteps": ["bước 1", "bước 2", "bước 3"],
  "detailedExplanation": "Giải thích sư phạm dễ hiểu cho học sinh THPT dưới 150 từ"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      return res.json({
        success: true,
        data: JSON.parse(response.text?.trim() || '{}'),
      });
    } catch (err) {
      console.error('Threat analysis error:', err);
    }
  }

  // Fallback rule-based threat analysis
  const lower = (inputContent as string).toLowerCase();
  const isHighRisk =
    lower.includes('otp') ||
    lower.includes('trúng thưởng') ||
    lower.includes('chuyển khoản') ||
    lower.includes('.xyz') ||
    lower.includes('nạp tiền') ||
    lower.includes('cọc') ||
    lower.includes('bit.ly') ||
    lower.includes('lộ đề');

  return res.json({
    success: true,
    data: {
      riskLevel: isHighRisk ? 'Cao' : 'Trung bình',
      riskScore: isHighRisk ? 92 : 55,
      threatCategory: isHighRisk ? 'Lừa đảo chiếm đoạt tài sản & Đánh cắp OTP' : 'Tin tức chưa được kiểm chứng',
      redFlags: [
        'Yêu cầu giao dịch tài chính hoặc thông tin định danh khẩn cấp',
        'Sử dụng kênh truyền thông không chính thống',
        'Có dấu hiệu tạo áp lực thời gian',
      ],
      psychologicalTricks: ['Đánh vào lòng tham hoặc nỗi sợ hãi', 'Tạo tâm lý bầy đàn và gấp gáp'],
      siftRecommendations: {
        stop: 'Dừng mọi thao tác nhấp chuột hoặc chuyển tiền.',
        investigate: 'Tra cứu tên miền hoặc số điện thoại trên các kênh chính thức.',
        find: 'Tìm kiếm tin cảnh báo lừa đảo tương tự trên các trang báo chí uy tín.',
        trace: 'Lưu ảnh chụp màn hình và gửi báo cáo cho nhà trường hoặc cơ quan chức năng.',
      },
      actionableSteps: [
        'Không nhấp vào bất kỳ đường liên kết nào trong tin nhắn',
        'Không gửi mã OTP, mật khẩu hay số tài khoản cho đối tượng',
        'Chặn tài khoản và báo cáo tới đầu số 156 / 5656',
      ],
      detailedExplanation:
        'Nội dung có dấu hiệu đặc trưng của kịch bản lừa đảo nhắm vào tâm lý học sinh THPT. Kẻ gian thường lợi dụng sự thiếu kinh nghiệm để chiếm đoạt tài sản.',
    },
  });
});

// 3. SafeNet Teacher Scenario Generator
app.post('/api/safenet/generate-scenario', async (req, res) => {
  const { topic, category, targetGrade, difficulty } = req.body;

  if (ai) {
    try {
      const prompt = `Bạn là Chuyên gia Giáo dục Kỹ năng số và An ninh mạng học đường THPT tại Việt Nam.
Hãy sáng tạo 1 tình huống giáo dục giả lập hoàn chỉnh cho phân hệ "SAFENET AI - LÁ CHẮN CÔNG DÂN SỐ" thuộc trường THPT Nguyễn Dục.
Chủ đề yêu cầu: ${topic || 'Lừa đảo mạng xã hội hoặc Deepfake hoặc Tin giả học đường'}
Thể loại: ${category || 'phishing'}
Khối lớp: ${targetGrade || 'Khối 12'}
Độ khó: ${difficulty || 'trung_binh'}

Trả về JSON thuần túy (không markdown):
{
  "title": "Tiêu đề tình huống hấp dẫn, thực tế với học sinh Việt Nam",
  "category": "${category || 'phishing'}",
  "difficulty": "${difficulty || 'trung_binh'}",
  "description": "Mô tả ngắn gọn bối cảnh tình huống",
  "targetGrade": "${targetGrade || 'Khối 12'}",
  "senderInfo": {
    "name": "Tên người gửi / Fanpage giả mạo",
    "handleOrNumber": "Số điện thoại hoặc link giả",
    "platform": "Zalo" | "Messenger" | "SMS" | "TikTok" | "Facebook",
    "verifiedBadge": false
  },
  "context": "Bối cảnh xảy ra tình huống cụ thể trong đời sống học sinh",
  "stages": [
    {
      "stageId": 1,
      "timeAgo": "Vừa xong",
      "promptText": "Nội dung tin nhắn / bài đăng kẻ xấu gửi tới học sinh",
      "redFlags": [
        {
          "id": "rf_1",
          "label": "Tên dấu hiệu đỏ 1",
          "explanation": "Giải thích vì sao đây là dấu hiệu lừa đảo"
        },
        {
          "id": "rf_2",
          "label": "Tên dấu hiệu đỏ 2",
          "explanation": "Giải thích chi tiết"
        }
      ],
      "choices": [
        {
          "id": "c1_unsafe",
          "text": "Hành vi mắc bẫy phổ biến của học sinh",
          "isSafeAction": false,
          "score": 0,
          "aiMentorFeedback": "Giải thích hậu quả nguy hiểm của hành vi này",
          "competencyImpact": {
            "threatIdentification": 0,
            "safeResponse": 0,
            "dataProtection": 10,
            "criticalThinking": 0,
            "digitalCulture": 10
          }
        },
        {
          "id": "c2_safe",
          "text": "Hành vi ứng phó chuẩn xác, an toàn của công dân số gương mẫu",
          "isSafeAction": true,
          "score": 100,
          "aiMentorFeedback": "Lời khen ngợi và phân tích vì sao hành động này đúng chuẩn",
          "competencyImpact": {
            "threatIdentification": 100,
            "safeResponse": 100,
            "dataProtection": 100,
            "criticalThinking": 100,
            "digitalCulture": 100
          }
        }
      ]
    }
  ],
  "learningTakeaways": ["Bài học 1", "Bài học 2", "Bài học 3"],
  "siftGuide": {
    "stop": "Lời khuyên Dừng lại",
    "investigate": "Lời khuyên Điều tra nguồn tin",
    "find": "Lời khuyên Tìm nguồn kiểm chứng",
    "trace": "Lời khuyên Lần theo ngữ cảnh gốc"
  }
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      return res.json({
        success: true,
        data: JSON.parse(response.text?.trim() || '{}'),
      });
    } catch (err) {
      console.error('Scenario generation error:', err);
    }
  }

  // Fallback scenario generator
  return res.json({
    success: true,
    data: {
      title: `Tình huống mô phỏng: ${topic || 'Cảnh báo lừa đảo tài khoản trực tuyến'}`,
      category: category || 'phishing',
      difficulty: difficulty || 'trung_binh',
      description: 'Tình huống mô phỏng giúp học sinh THPT nhận diện bẫy kỹ thuật số trong môi trường mạng xã hội.',
      targetGrade: targetGrade || 'Khối 12',
      senderInfo: {
        name: 'Bộ Phận An Ninh Mạng Giả Danh',
        handleOrNumber: 'cskh_security_support',
        platform: 'Zalo',
        verifiedBadge: false,
      },
      context: 'Học sinh nhận được thông báo tài khoản cá nhân có nguy cơ bị khóa nếu không xác minh trong 24h.',
      stages: [
        {
          stageId: 1,
          timeAgo: 'Vừa xong',
          promptText:
            'Cảnh báo: Tài khoản của bạn bị phát hiện vi phạm bản quyền cộng đồng. Hãy truy cập http://xacminh-taikhoan-security.xyz để giữ lại tài khoản.',
          redFlags: [
            {
              id: 'rf_fake_domain',
              label: 'Đường dẫn tên miền giả mạo',
              explanation: 'Các nền tảng lớn không bao giờ gửi link xác minh qua tin nhắn cá nhân với đuôi miền lạ.',
            },
          ],
          choices: [
            {
              id: 'c1_fail',
              text: 'Đăng nhập vào link để tránh bị khóa nick',
              isSafeAction: false,
              score: 0,
              aiMentorFeedback: 'Bị chiếm đoạt mật khẩu và mất quyền kiểm soát tài khoản.',
              competencyImpact: {
                threatIdentification: 0,
                safeResponse: 0,
                dataProtection: 0,
                criticalThinking: 0,
                digitalCulture: 10,
              },
            },
            {
              id: 'c2_pass',
              text: 'Bỏ qua tin nhắn, kiểm tra mục Thông báo bảo mật chính thức trong Cài đặt ứng dụng',
              isSafeAction: true,
              score: 100,
              aiMentorFeedback: 'Xử lý chuẩn xác và bảo vệ tài khoản thành công.',
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
        'Không bao giờ đăng nhập tài khoản qua link lạ được gửi trong tin nhắn.',
        'Kích hoạt xác thực 2 bước (2FA) cho tất cả tài khoản mạng xã hội.',
      ],
      siftGuide: {
        stop: 'Dừng lại, không bấm vào link.',
        investigate: 'Kiểm tra hộp thư bảo mật chính thức.',
        find: 'Tìm kiếm hướng dẫn trên trang trợ giúp chính hãng.',
        trace: 'Báo cáo tài khoản mạo danh.',
      },
    },
  });
});

// 4. SafeNet Evaluate Student Performance
app.post('/api/safenet/evaluate-student-performance', async (req, res) => {
  const { studentName, scenarioTitle, decisionPath, identifiedRedFlags, totalScore } = req.body;

  if (ai) {
    try {
      const prompt = `Bạn là Chuyên gia Đánh giá Năng lực Số học đường THPT của trường THPT Nguyễn Dục.
Học sinh: ${studentName || 'Học sinh'}
Tình huống vừa trải nghiệm: ${scenarioTitle}
Điểm số đạt được: ${totalScore}/100
Các lựa chọn học sinh đã chọn: ${JSON.stringify(decisionPath)}
Các dấu hiệu đỏ học sinh đã nhận diện: ${JSON.stringify(identifiedRedFlags)}

Hãy xuất đánh giá sư phạm định dạng JSON (không markdown):
{
  "aiEvaluationSummary": "Nhận xét tổng quan tiến trình xử lý của học sinh (khoảng 3 câu)",
  "aiStrengths": ["Điểm mạnh 1", "Điểm mạnh 2", "Điểm mạnh 3"],
  "aiAreasToImprove": ["Điểm cần lưu ý và rèn luyện thêm"],
  "competencies": {
    "threatIdentification": số từ 0 đến 100,
    "safeResponse": số từ 0 đến 100,
    "dataProtection": số từ 0 đến 100,
    "criticalThinking": số từ 0 đến 100,
    "digitalCulture": số từ 0 đến 100
  },
  "earnedBadge": "Tên huy hiệu vinh danh (ví dụ: Lá chắn Vàng An toàn số, Dũng sĩ Phá bẫy Phishing, Chuyên gia Bác bỏ Tin giả...)"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      return res.json({
        success: true,
        data: JSON.parse(response.text?.trim() || '{}'),
      });
    } catch (err) {
      console.error('SafeNet evaluation error:', err);
    }
  }

  // Fallback evaluation
  const score = totalScore || 85;
  return res.json({
    success: true,
    data: {
      aiEvaluationSummary: `Em ${studentName || 'Học sinh'} đã hoàn thành tình huống an toàn số với kết quả ${score}/100. Em thể hiện tinh thần cảnh giác tốt trước các nguy cơ trên không gian mạng.`,
      aiStrengths: [
        'Ý thức bảo vệ dữ liệu cá nhân tốt',
        'Bình tĩnh trước các thủ thuật gây áp lực tâm lý',
        'Áp dụng tốt quy tắc an toàn số học đường',
      ],
      aiAreasToImprove: ['Hãy tiếp tục luyện tập thêm các tình huống Deepfake và tin giả nâng cao.'],
      competencies: {
        threatIdentification: Math.min(100, score + 2),
        safeResponse: score,
        dataProtection: Math.min(100, score + 4),
        criticalThinking: score,
        digitalCulture: 92,
      },
      earnedBadge: score >= 90 ? 'Lá chắn Vàng An toàn số' : 'Hiệp sĩ Số Tiềm năng',
    },
  });
});

// Mount Vite or static serving
async function setupServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nguyễn Dục AI Learning Hub backend running on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
});
