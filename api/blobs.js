import { list, del } from '@vercel/blob';

// 🔒 HARDCODED TOKEN – replace with your actual token
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const BLOB_STORE_ID = process.env.BLOB_STORE_ID || '';

// Add validation to help debug
if (!BLOB_READ_WRITE_TOKEN) {
  console.error('Missing BLOB_READ_WRITE_TOKEN environment variable');
}

export default async function handler(req, res) {
  // Enable CORS for local testing (optional)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ---------- GET: List all blobs ----------
  if (req.method === 'GET') {
    try {
      const result = await list({ token: BLOB_READ_WRITE_TOKEN });
      return res.status(200).json({
        blobs: result.blobs,
        storeId: BLOB_STORE_ID, // sent to the frontend for display
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
