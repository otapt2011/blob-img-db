// frontend/config.js
const CONFIG = {
    development: {
        backendUrl: 'http://localhost:3001',
        apiBase: 'https://blob-img-db.vercel.app/api'
    },
    production: {
        backendUrl: 'https://your-backend.com',
        apiBase: 'https://blob-img-db.vercel.app/api'
    }
};

const ENV = process.env.NODE_ENV || 'development';
const currentConfig = CONFIG[ENV];
