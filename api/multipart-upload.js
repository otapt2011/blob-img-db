import {
  createMultipartUpload,
  uploadPart,
  completeMultipartUpload,
} from '@vercel/blob';
import { IncomingForm } from 'formidable';
import fs from 'fs';

const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const API_SECRET_KEY = process.env.API_SECRET_KEY;

export const config = { api: { bodyParser: false } };

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

  const action = req.query.action;
  if (!action) return res.status(400).json({ error: 'Missing action' });

  if (action === 'start') {
    const { filename, contentType, category } = req.body || {};
    if (!filename || !contentType) {
      return res.status(400).json({ error: 'filename and contentType required' });
    }
    try {
      const multipart = await createMultipartUpload({
        access: 'public',
        contentType,
        token: BLOB_READ_WRITE_TOKEN,
        pathname: `uploads/${category || 'videos'}/${filename}`,
      });
      return res.status(200).json(multipart);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (action === 'uploadPart') {
    // This action receives a file chunk in the "chunk" field.
    const form = new IncomingForm();
    try {
      const { fields, files } = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve({ fields, files });
        });
      });
      let file = files.chunk;
      if (Array.isArray(file)) file = file[0];
      if (!file) return res.status(400).json({ error: 'No chunk provided' });

      const { multipartUploadId, partNumber } = fields;
      const buffer = fs.readFileSync(file.filepath);

      const part = await uploadPart({
        multipartUploadId,
        partNumber: parseInt(partNumber, 10),
        token: BLOB_READ_WRITE_TOKEN,
        body: buffer,
      });

      return res.status(200).json(part);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (action === 'complete') {
    const { multipartUploadId, parts } = req.body || {};
    if (!multipartUploadId || !Array.isArray(parts)) {
      return res.status(400).json({ error: 'multipartUploadId and parts required' });
    }
    try {
      const result = await completeMultipartUpload({
        multipartUploadId,
        token: BLOB_READ_WRITE_TOKEN,
        parts,
      });
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(400).json({ error: 'Invalid action' });
}
