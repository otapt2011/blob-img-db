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
  if (!clientKey || clientKey !== process.env.API_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Required
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN is not set' });
  }

  const { filename, contentType, category } = req.body || {};
  if (!filename || !contentType) {
    return res.status(400).json({ error: 'filename and contentType are required' });
  }

  try {
    // Try importing from @vercel/blob (main module)
    const blobModule = await import('@vercel/blob');

    // Look for known function names
    const uploadUrlFn = blobModule.createClientUploadUrl || blobModule.generateClientUploadUrl;

    if (typeof uploadUrlFn !== 'function') {
      return res.status(500).json({
        error: 'Upload URL function not found',
        availableExports: Object.keys(blobModule)
      });
    }

    const result = await uploadUrlFn({
      token: process.env.BLOB_READ_WRITE_TOKEN,
      pathname: `uploads/${category || 'videos'}/${filename}`,
      contentType,
      access: 'public',
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: error.message });
  }
}
