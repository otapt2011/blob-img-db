export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  // CORS (so we can call from browser)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Dynamically import the client sub-package
    const clientModule = await import('@vercel/blob/client');

    // Return the list of exported functions
    return res.status(200).json({ exports: Object.keys(clientModule) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
