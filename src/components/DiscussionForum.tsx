import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MessageSquare,
  Sparkles,
  ThumbsUp,
  CheckCircle,
  Plus,
  Search,
  Filter,
  Bot,
  Send,
  Pin,
  Flag,
  Share2,
  ChevronDown,
} from 'lucide-react';
import { aiService } from '../services/aiService';

export const DiscussionForum: React.FC = () => {
  const {
    currentUser,
    classes,
    discussions,
    addDiscussionPost,
    addDiscussionComment,
    markCommentHelpful,
    toggleLikePost,
  } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPostModal, setShowNewPostModal] = useState(false);

  // New Post Form States
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState<'bai_tap' | 'ly_thuyet' | 'thao_luan_chung'>('bai_tap');
  const [postClassId, setPostClassId] = useState(classes[0]?.id || 'class_12a1');

  // AI Refiner Assistant
  const [isAiRefining, setIsAiRefining] = useState(false);
  const [aiRefineAdvice, setAiRefineAdvice] = useState<any>(null);

  // Active expanded discussion thread ID
  const [activeThreadId, setActiveThreadId] = useState<string>(discussions[0]?.id || '');
  const [commentInput, setCommentInput] = useState('');

  // Filtering
  const filteredDiscussions = discussions.filter((p) => {
    const matchClass = selectedClassId === 'all' || p.classId === selectedClassId;
    const matchSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchClass && matchSearch;
  });

  const activeThread = discussions.find((p) => p.id === activeThreadId) || discussions[0];

  const handleAskAiToRefine = async () => {
    if (!postContent.trim()) return;
    setIsAiRefining(true);
    const result = await aiService.forumAssist({
      action: 'refine-question',
      questionText: postContent,
    });
    setIsAiRefining(false);
    if (result && result.data) {
      setAiRefineAdvice(result.data);
      if (result.data.suggestedTitle) setPostTitle(result.data.suggestedTitle);
      if (result.data.refinedContent) setPostContent(result.data.refinedContent);
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;
    addDiscussionPost(postTitle, postContent, postCategory, ['Tin học 12', 'Hỏi đáp'], postClassId);
    setPostTitle('');
    setPostContent('');
    setShowNewPostModal(false);
    setAiRefineAdvice(null);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !activeThread) return;
    addDiscussionComment(activeThread.id, commentInput);
    setCommentInput('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              Cộng đồng học tập
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              Trường THPT Nguyễn Dục
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Diễn đàn Thảo luận & Trao đổi bài học
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Nơi học sinh và giáo viên cùng nhau gỡ rối bài tập, chia sẻ mẹo lập trình và học hỏi lẫn nhau.
          </p>
        </div>

        <button
          onClick={() => setShowNewPostModal(true)}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Đặt câu hỏi / Chủ đề mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm chủ đề, lỗi thẻ HTML, câu hỏi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-transparent focus:outline-hidden text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Lọc theo lớp:</span>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700"
          >
            <option value="all">Tất cả các lớp</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                Lớp {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Thread List vs Active Thread Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Thread List */}
        <div className="lg:col-span-5 space-y-3">
          {filteredDiscussions.map((post) => {
            const isSelected = post.id === activeThread?.id;
            return (
              <div
                key={post.id}
                onClick={() => setActiveThreadId(post.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-400 shadow-md ring-1 ring-blue-400'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <img
                      src={post.authorAvatar}
                      alt={post.authorName}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-semibold text-slate-800">{post.authorName}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        post.authorRole === 'TEACHER'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {post.authorRole === 'TEACHER' ? 'GV' : 'HS'}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400">{post.createdAt}</span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2">{post.content}</p>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px]">
                      <ThumbsUp className="w-3.5 h-3.5 text-blue-600" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      {post.comments.length} phản hồi
                    </span>
                  </div>

                  {post.isSolved && (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Đã giải quyết
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Active Thread Details & Comments */}
        <div className="lg:col-span-7">
          {activeThread ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
              {/* Thread Header */}
              <div className="space-y-3 pb-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={activeThread.authorAvatar}
                      alt={activeThread.authorName}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div>
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        {activeThread.authorName}
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.2 rounded-full">
                          Lớp {activeThread.className}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Đăng lúc: {activeThread.createdAt}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleLikePost(activeThread.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Thích ({activeThread.likes})</span>
                  </button>
                </div>

                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  {activeThread.title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {activeThread.content}
                </p>
              </div>

              {/* Comments Section */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center justify-between">
                  <span>Các câu trả lời & Phản hồi ({activeThread.comments.length})</span>
                </h4>

                <div className="space-y-3">
                  {activeThread.comments.map((comm) => (
                    <div
                      key={comm.id}
                      className={`p-4 rounded-2xl border space-y-2 text-xs ${
                        comm.isHelpful
                          ? 'bg-emerald-50/60 border-emerald-300'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={comm.authorAvatar}
                            alt={comm.authorName}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="font-bold text-slate-900">{comm.authorName}</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              comm.authorRole === 'TEACHER'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {comm.authorRole === 'TEACHER' ? 'Giáo viên' : 'Học sinh'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">{comm.createdAt}</span>
                          {comm.isHelpful && (
                            <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Hữu ích
                            </span>
                          )}
                          {currentUser.role === 'TEACHER' && (
                            <button
                              onClick={() => markCommentHelpful(activeThread.id, comm.id)}
                              className="text-[10px] text-blue-600 hover:underline font-semibold"
                            >
                              {comm.isHelpful ? 'Bỏ dấu' : 'Duyệt câu trả lời hay'}
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-slate-700 leading-relaxed">{comm.content}</p>
                    </div>
                  ))}
                </div>

                {/* Comment Input Box */}
                <form onSubmit={handleSendComment} className="pt-2 flex gap-2">
                  <input
                    type="text"
                    placeholder="Viết câu trả lời hoặc trao đổi thêm..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400">
              Chưa có chủ đề nào được chọn.
            </div>
          )}
        </div>
      </div>

      {/* New Post Modal with AI Refiner */}
      {showNewPostModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-black text-base text-slate-900">
                Tạo câu hỏi / Chủ đề thảo luận mới
              </h3>
              <button
                onClick={() => setShowNewPostModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Tiêu đề thắc mắc *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Làm thế nào để gộp ô trong bảng HTML bằng colspan?"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-blue-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Nội dung câu hỏi *</label>
                  <button
                    type="button"
                    onClick={handleAskAiToRefine}
                    disabled={isAiRefining || !postContent.trim()}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer disabled:opacity-40"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isAiRefining ? 'AI đang góp ý...' : 'AI giúp diễn đạt rõ ràng hơn'}</span>
                  </button>
                </div>

                <textarea
                  rows={4}
                  required
                  placeholder="Mô tả cụ thể vấn đề em đang gặp phải..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-blue-500"
                />
              </div>

              {aiRefineAdvice && (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <Bot className="w-3.5 h-3.5" />
                    <span>Gợi ý từ AI:</span>
                  </div>
                  <p className="text-[11px]">{aiRefineAdvice.tips}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Đăng lên diễn đàn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
