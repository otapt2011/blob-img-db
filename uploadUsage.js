const API_SECRET_KEY = 'your-secret-key'; // Same key as the API

async function uploadImage(file, category = null, customFolder = null) {
  const formData = new FormData();
  formData.append('image', file);

  let url = '/api/upload';
  if (customFolder) {
    url += `?folder=${encodeURIComponent(customFolder)}`;
  } else if (category) {
    url += `?category=${encodeURIComponent(category)}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_SECRET_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }

  return await response.json();
}

// Usage
const file = document.querySelector('input[type="file"]').files[0];
uploadImage(file, 'products')
  .then(blob => console.log('Uploaded:', blob.url))
  .catch(err => console.error(err));
