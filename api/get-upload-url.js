const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const API_SECRET_KEY = process.env.API_SECRET_KEY;

export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Authentication
  const authHeader = req.headers.authorization || '';
  const clientKey = authHeader.replace('Bearer ', '');
  if (!clientKey || clientKey !== API_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { filename, contentType, category } = req.body || {};
  if (!filename || !contentType) {
    return res.status(400).json({ error: 'filename and contentType are required' });
  }

  try {
    // Call Vercel Blob REST API to create a client upload URL
    const blobApiUrl = 'https://blob.vercel-storage.com';
    const pathname = `uploads/${category || 'videos'}/${filename}`;

    const response = await fetch(blobApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BLOB_READ_WRITE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pathname,
        contentType,
        access: 'public',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Blob API error:', errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    // data should contain { url, downloadUrl, ... } – we need the upload URL
    // According to Vercel Blob API, the response includes "url" which is the upload URL
    return res.status(200).json({ url: data.url });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return res.status(500).json({ error: error.message });
  }
}
