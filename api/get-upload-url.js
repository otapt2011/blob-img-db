// api/get-upload-url.js
import { createClient } from '@vercel/blob';

const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const API_SECRET_KEY = process.env.API_SECRET_KEY;

export const config = { api: { bodyParser: true } }; // JSON body is fine (small)

export default async function handler(req, res) {
  // CORS headers (adjust as needed)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // ---------- AUTHENTICATION CHECK ----------
  const authHeader = req.headers.authorization || '';
  const clientKey = authHeader.replace('Bearer ', '');
  if (!clientKey || clientKey !== API_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
  }

  // ---------- INPUT ----------
  const { filename, contentType, category } = req.body || {};
  if (!filename || !contentType) {
    return res.status(400).json({ error: 'filename and contentType are required' });
  }

  // Construct the full path exactly as before
  const folder = `uploads/${category || 'videos'}/`;
  const pathname = folder + filename;

  try {
    // Create a Blob client using the token
    const blob = createClient({ token: BLOB_READ_WRITE_TOKEN });

    // Generate a presigned upload URL (this DOES NOT upload any file)
    const { url, headers } = await blob.generateClientUploadUrl({
      pathname,
      contentType,
      access: 'public',
      // Optional: add metadata
      // metadata: { lastModified: String(lastModified) },
    });

    return res.status(200).json({ url, headers });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate upload URL' });
  }
}
