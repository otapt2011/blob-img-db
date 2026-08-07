import { list, del } from '@vercel/blob';

const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const BLOB_STORE_ID = process.env.BLOB_STORE_ID || '';
const API_SECRET_KEY = process.env.API_SECRET_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ---------- AUTHENTICATION ----------
  const authHeader = req.headers.authorization || '';
  const clientKey = authHeader.replace('Bearer ', '');

  if (!clientKey || clientKey !== API_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
  }

  // ---------- GET: List all blobs ----------
  if (req.method === 'GET') {
    try {
      const result = await list({ token: BLOB_READ_WRITE_TOKEN });

      // ─── NEW: Map each blob to include `lastModified` from metadata ───
      const blobsWithMeta = result.blobs.map(blob => ({
        ...blob, // keep all original fields (url, pathname, size, uploadedAt, etc.)
        lastModified: blob.metadata?.lastModified
          ? Number(blob.metadata.lastModified)   // convert string to number
          : blob.uploadedAt,                     // fallback for old images
      }));

      return res.status(200).json({
        blobs: blobsWithMeta,   // ← now includes `lastModified`
        storeId: BLOB_STORE_ID,
      });
    } catch (error) {
      console.error('List error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // ---------- DELETE: Remove a blob ----------
  if (req.method === 'DELETE') {
    try {
      const { pathname } = req.body;
      if (!pathname) {
        return res.status(400).json({ error: 'Missing pathname in request body' });
      }
      await del(pathname, { token: BLOB_READ_WRITE_TOKEN });
      return res.status(200).json({ success: true, pathname });
    } catch (error) {
      console.error('Delete error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  res.setHeader('Allow', ['GET', 'DELETE', 'OPTIONS']);
  return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
