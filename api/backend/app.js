// backend/app.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());

// Mount auth routes
app.use('/api/auth', authRoutes);

app.listen(3001, () => {
    console.log('Backend running on http://localhost:3001');
});
