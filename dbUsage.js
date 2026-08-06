const API_SECRET_KEY = 'your-secret-key'; // Store this securely, or fetch from config

// List blobs
async function listBlobs() {
  const response = await fetch('/api/blobs', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${API_SECRET_KEY}`,
    },
  });
  const data = await response.json();
  console.log(data.blobs);
}

// Delete blob
async function deleteBlob(pathname) {
  const response = await fetch('/api/blobs', {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${API_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pathname }),
  });
  const data = await response.json();
  console.log(data);
}
