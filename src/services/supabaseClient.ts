import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SubmissionFile } from '../types';

// Read configuration from environment or localStorage override
const envSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envSupabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let cachedClient: SupabaseClient | null = null;

export const getSupabaseConfig = () => {
  const customUrl = localStorage.getItem('nd_supabase_url');
  const customKey = localStorage.getItem('nd_supabase_key');
  return {
    url: customUrl || envSupabaseUrl,
    key: customKey || envSupabaseKey,
  };
};

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseConfig();
  return Boolean(url && key && url.startsWith('http'));
};

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key || !url.startsWith('http')) {
    return null;
  }
  if (!cachedClient) {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return cachedClient;
};

export const setCustomSupabaseConfig = (url: string, key: string) => {
  if (url) localStorage.setItem('nd_supabase_url', url);
  else localStorage.removeItem('nd_supabase_url');

  if (key) localStorage.setItem('nd_supabase_key', key);
  else localStorage.removeItem('nd_supabase_key');

  cachedClient = null;
};

/**
 * Upload file thực tế:
 * 1. Nếu có Supabase config -> Upload trực tiếp vào Supabase Storage bucket 'submission-files'.
 * 2. Nếu chưa điền Supabase -> Upload vào backend endpoint Express /api/upload lưu trực tiếp vào ổ cứng server.
 * Cả hai cách đều lưu trữ file thực sự, tải được file về và lưu bền vững khi refresh trang!
 */
export const uploadSubmissionFile = async (
  file: File,
  metadata: {
    studentId: string;
    studentName: string;
    classId: string;
    assignmentId: string;
  },
  onProgress?: (progress: number) => void
): Promise<SubmissionFile> => {
  // Check file size (default 20MB)
  const maxBytes = 20 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`Kích thước file (${(file.size / (1024 * 1024)).toFixed(1)}MB) vượt quá giới hạn tối đa 20MB/file.`);
  }

  // Determine file extension
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const allowed = ['pdf', 'docx', 'pptx', 'xlsx', 'jpg', 'png', 'html', 'css', 'js', 'py', 'zip'];
  if (!allowed.includes(ext)) {
    throw new Error(`Định dạng .${ext} chưa được hỗ trợ. Vui lòng chọn tệp: ${allowed.join(', ')}.`);
  }

  const supabase = getSupabaseClient();

  if (supabase && isSupabaseConfigured()) {
    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `${metadata.classId}/${metadata.assignmentId}/${metadata.studentId}/${Date.now()}_${sanitizedName}`;

      onProgress?.(30);

      const { data, error } = await supabase.storage
        .from('submission-files')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.warn('Supabase upload error, falling back to server disk storage:', error.message);
        throw error;
      }

      onProgress?.(80);

      // Create signed URL for private bucket (valid 24h)
      const { data: signedData, error: signedError } = await supabase.storage
        .from('submission-files')
        .createSignedUrl(storagePath, 86400);

      const storageUrl = signedData?.signedUrl || '';
      onProgress?.(100);

      return {
        id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        fileName: file.name,
        fileSize: file.size,
        fileType: ext,
        storagePath: data?.path || storagePath,
        storageUrl,
        uploadedAt: new Date().toLocaleString('vi-VN'),
      };
    } catch (supabaseErr) {
      console.warn('Supabase upload failed, falling back to full-stack server upload:', supabaseErr);
    }
  }

  // Fallback: Real upload to backend server storage (/api/upload)
  onProgress?.(30);
  const formData = new FormData();
  formData.append('file', file);
  formData.append('studentId', metadata.studentId);
  formData.append('assignmentId', metadata.assignmentId);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  onProgress?.(80);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Upload lên máy chủ thất bại: ${errorText || res.statusText}`);
  }

  const json = await res.json();
  onProgress?.(100);

  return {
    id: json.fileId || `file_${Date.now()}`,
    fileName: json.fileName || file.name,
    fileSize: json.fileSize || file.size,
    fileType: ext,
    storagePath: json.filePath || `uploads/${file.name}`,
    storageUrl: json.fileUrl || `/api/files/${encodeURIComponent(json.fileName || file.name)}`,
    uploadedAt: new Date().toLocaleString('vi-VN'),
  };
};

/**
 * Format bytes to readable size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
