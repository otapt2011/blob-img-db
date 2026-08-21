export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  // ---------- CORS ----------
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // ---------- Auth ----------
  const authHeader = req.headers.authorization || '';
  const clientKey = authHeader.replace('Bearer ', '');
  if (!clientKey || clientKey !== process.env.API_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
  }

  // ---------- Check required env vars ----------
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN is not set' });
  }

  const { filename, contentType, category } = req.body || {};
  if (!filename || !contentType) {
    return res.status(400).json({ error: 'filename and contentType are required' });
  }

  try {
    // Dynamically import the SDK to avoid top-level import failures
    let generateClientUploadUrl;
    try {
      const mod = await import('@vercel/blob/client');
      generateClientUploadUrl = mod.generateClientUploadUrl;
    } catch (e1) {
      const mod2 = await import('@vercel/blob');
      generateClientUploadUrl = mod2.generateClientUploadUrl;
    }

    if (typeof generateClientUploadUrl !== 'function') {
      return res.status(500).json({ error: 'generateClientUploadUrl is not available' });
    }

    // Call the function
    const result = await generateClientUploadUrl({
      token: process.env.BLOB_READ_WRITE_TOKEN,
      pathname: `uploads/${category || 'videos'}/${filename}`,
      contentType,
      access: 'public',
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate upload URL' });
  }
}
