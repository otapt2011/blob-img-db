const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const API_SECRET_KEY = process.env.API_SECRET_KEY;

export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Auth
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
    // Call Vercel Blob REST API to get a direct upload URL
    const response = await fetch('https://blob.vercel-storage.com', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BLOB_READ_WRITE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pathname: `uploads/${category || 'videos'}/${filename}`,
        contentType,
        access: 'public',
        addRandomSuffix: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vercel Blob REST error:', errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    // data.url is the upload URL
    return res.status(200).json({ uploadUrl: data.url });
  } catch (error) {
    console.error('get-upload-url error:', error);
    return res.status(500).json({ error: error.message });
  }
}
