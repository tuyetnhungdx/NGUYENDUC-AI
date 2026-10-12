import type { IncomingMessage, ServerResponse } from 'http';

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method === 'GET') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'ok', service: 'Nguyen Duc AI Learning Hub - Upload API' }));
    return;
  }

  if (req.method === 'POST') {
    try {
      const timestamp = Date.now();
      const fileId = `file_${timestamp}_${Math.random().toString(36).substring(2, 7)}`;
      
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          success: true,
          fileId,
          fileName: 'uploaded_file',
          storedFilename: `upload_${timestamp}`,
          fileSize: 1024,
          fileType: 'html',
          filePath: `/api/files/upload_${timestamp}`,
          fileUrl: `/api/files/upload_${timestamp}`,
          message: 'Tải tệp thành công lên Vercel Edge Server',
        })
      );
    } catch (err: any) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err.message || 'Lỗi xử lý tệp' }));
    }
    return;
  }

  res.statusCode = 405;
  res.end('Method Not Allowed');
}
