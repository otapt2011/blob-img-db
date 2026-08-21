import { generateClientUploadUrl } from '@vercel/blob/client';

const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const API_SECRET_KEY = process.env.API_SECRET_KEY;

export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  // CORS (same as your uploads.js)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Auth (same as uploads.js)
  const authHeader = req.headers.authorization || '';
  const clientKey = authHeader.replace('Bearer ', '');
  if (!clientKey || clientKey !== API_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
  }

  const { filename, contentType, category } = req.body || {};
  if (!filename || !contentType) {
    return res.status(400).json({ error: 'filename and contentType are required' });
  }

  try {
    // Call the standalone function directly (no createClient)
    const { url, headers } = await generateClientUploadUrl({
      token: BLOB_READ_WRITE_TOKEN,
      pathname: `uploads/${category || 'videos'}/${filename}`,
      contentType,
      access: 'public',
    });

    return res.status(200).json({ url, headers });
  } catch (error) {
    console.error('generateClientUploadUrl error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate upload URL' });
  }
}
