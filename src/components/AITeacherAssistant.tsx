import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bot,
  Sparkles,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  FileText,
  TrendingUp,
  RefreshCw,
  Plus,
  Send,
  Users,
} from 'lucide-react';
import { aiService } from '../services/aiService';

export const AITeacherAssistant: React.FC = () => {
  const { classes, assignments, submissions, logAction } = useApp();

  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || 'class_12a1');
  const [selectedTopic, setSelectedTopic] = useState('Tin học 12 – Bài 9: Tạo danh sách, bảng HTML');
  const [activeMode, setActiveMode] = useState<'analyze_errors' | 'generate_rubric' | 'remedial_plan'>('analyze_errors');
  const [isLoading, setIsLoading] = useState(false);

  // Result state
  const [analysisResult, setAnalysisResult] = useState<any>({
    totalAnalyzed: 38,
    completionRate: '82%',
    topCommonErrors: [
      {
        category: 'Thẻ bảng (table)',
        percentage: '42%',
        description: 'Quên đóng thẻ </tr> ở cuối hàng hoặc chưa đóng </table>',
        solution: 'Chiếu 1 bài mẫu lỗi lên máy chiếu và cho cả lớp thi đua phát hiện trong 3 phút',
      },
      {
        category: 'Danh sách có thứ tự (ol)',
        percentage: '31%',
        description: 'Dùng thẻ <p> gõ số thủ công (1. 2. 3.) thay vì dùng thẻ <ol>',
        solution: 'Nhắc lại sự khác biệt giữa nội dung văn bản tĩnh và danh sách ngữ nghĩa (semantic)',
      },
    ],
    masteredTopics: ['Khai báo <!DOCTYPE html>', 'Tiêu đề h1 - h3', 'Danh sách không thứ tự (ul)'],
    remedialActionPlan: 'Tổ chức mini-game: "Tìm lỗi thẻ lồng nhau" trong 10 phút đầu tiết học tiếp theo.',
    differentiatedFeedback: 'Nhóm nâng cao: Khuyến khích thêm thuộc tính CSS border-collapse. Nhóm cơ bản: Tập trung đóng mở cặp thẻ tr/td.',
  });

  const handleRunTeacherAI = async (mode: 'analyze_errors' | 'generate_rubric' | 'remedial_plan') => {
    setActiveMode(mode);
    setIsLoading(true);

    const targetClass = classes.find((c) => c.id === selectedClassId);

    logAction('AI_TEACHER_ACTION', mode, `Phân tích cho lớp ${targetClass?.name}`);

    const res = await aiService.callTeacherAssistant({
      action: mode === 'generate_rubric' ? 'create-rubric' : 'analyze-errors',
      topic: selectedTopic,
      grade: '12',
      submissionsData: {
        className: targetClass?.name || '12A1',
        totalStudents: targetClass?.studentCount || 38,
        submissionsCount: submissions.length,
      },
    });

    setIsLoading(false);
    if (res && res.data) {
      setAnalysisResult(res.data);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-purple-800 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-blue-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              Công cụ Giáo viên
            </span>
            <span className="text-xs text-purple-200">
              Chương trình GDPT 2018 môn Tin học
            </span>
          </div>
          <h1 className="text-2xl font-black mt-1">
            AI Teacher Assistant – Trợ lý Phân tích Sư phạm
          </h1>
          <p className="text-xs text-purple-100 mt-0.5 max-w-2xl">
            Tổng hợp dữ liệu bài làm của học sinh, phát hiện nhóm lỗi thường gặp và gợi ý kế hoạch dạy học phân hóa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="bg-white/10 text-white border border-white/20 rounded-xl px-3 py-2 text-xs font-bold focus:outline-hidden"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id} className="text-slate-900">
                Lớp {c.name} ({c.studentCount} HS)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => handleRunTeacherAI('analyze_errors')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeMode === 'analyze_errors'
              ? 'bg-purple-50 border-purple-400 shadow-md'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-extrabold text-sm text-slate-900">1. Phân tích lỗi lớp</span>
            <span className="text-xs">📊</span>
          </div>
          <p className="text-xs text-slate-500">
            Tổng hợp các lỗi cú pháp và thiếu sót phổ biến của học sinh cả lớp.
          </p>
        </button>

        <button
          onClick={() => handleRunTeacherAI('generate_rubric')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeMode === 'generate_rubric'
              ? 'bg-purple-50 border-purple-400 shadow-md'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-extrabold text-sm text-slate-900">2. Soạn Rubric chuẩn</span>
            <span className="text-xs">📋</span>
          </div>
          <p className="text-xs text-slate-500">
            Sinh tiêu chí đánh giá chuẩn W3C và mục tiêu cần đạt môn Tin học.
          </p>
        </button>

        <button
          onClick={() => handleRunTeacherAI('remedial_plan')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeMode === 'remedial_plan'
              ? 'bg-purple-50 border-purple-400 shadow-md'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-extrabold text-sm text-slate-900">3. Kế hoạch củng cố</span>
            <span className="text-xs">💡</span>
          </div>
          <p className="text-xs text-slate-500">
            Đề xuất hoạt động 15 phút đầu tiết ôn tập và phân hóa năng lực.
          </p>
        </button>
      </div>

      {/* Main Results View */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-sm">
            AI đang phân tích các bài nộp của học sinh...
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Trích xuất dữ liệu từ các lần nộp theo mô hình 4C để tìm ra quy luật lỗi.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="bg-purple-100 text-purple-800 text-xs font-black px-2.5 py-0.5 rounded-full">
                Báo cáo kết quả
              </span>
              <h3 className="font-extrabold text-slate-900 text-base">
                Chuyên đề: {selectedTopic}
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              Dựa trên dữ liệu thực nghiệm lớp {classes.find((c) => c.id === selectedClassId)?.name}
            </span>
          </div>

          {activeMode === 'analyze_errors' && analysisResult?.topCommonErrors && (
            <div className="space-y-6">
              {/* Common errors cards */}
              <div>
                <h4 className="font-extrabold text-sm text-slate-800 mb-3">
                  Nhóm lỗi học sinh hay mắc phải nhất (Đã xếp theo tần suất)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisResult.topCommonErrors.map((errItem: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl border border-red-200 bg-red-50/40 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-red-950 text-sm">
                          {idx + 1}. {errItem.category}
                        </span>
                        <span className="bg-red-200 text-red-800 font-black text-xs px-2 py-0.5 rounded">
                          Tỷ lệ: {errItem.percentage}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        <strong>Hiện tượng:</strong> {errItem.description}
                      </p>
                      <div className="pt-2 border-t border-red-100 text-xs text-emerald-800 flex items-start gap-1.5 font-medium">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Gợi ý sư phạm:</strong> {errItem.solution}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Plan */}
              <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-2">
                <h4 className="font-extrabold text-sm text-blue-950 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  <span>Kế hoạch củng cố kiến thức đề xuất</span>
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {analysisResult.remedialActionPlan}
                </p>
              </div>

              {/* Differentiated feedback */}
              <div className="p-5 rounded-2xl border border-purple-200 bg-purple-50/40 space-y-2">
                <h4 className="font-extrabold text-sm text-purple-950 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Hướng dẫn dạy học phân hóa đối tượng</span>
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {analysisResult.differentiatedFeedback}
                </p>
              </div>
            </div>
          )}

          {activeMode === 'generate_rubric' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-slate-800">
                Khung Rubric Đánh giá môn Tin học (Chuẩn GDPT 2018)
              </h4>
              <div className="divide-y divide-slate-100">
                {(analysisResult.criteria || []).map((cr: any, i: number) => (
                  <div key={i} className="py-3 text-xs flex justify-between gap-4">
                    <div>
                      <div className="font-bold text-slate-900">{cr.name}</div>
                      <div className="text-slate-600 mt-0.5">{cr.description}</div>
                      {cr.commonMistakes && (
                        <div className="text-red-600 text-[11px] mt-0.5">
                          Lưu ý lỗi: {cr.commonMistakes}
                        </div>
                      )}
                    </div>
                    <span className="font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded h-fit shrink-0">
                      {cr.weight}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
