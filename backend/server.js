//Loads environment variables from .env file into process.env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
//Imports the database connection from config/db.js.
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

// ============================================
// CONFIGURATION
// ============================================
// Backend port - uses .env PORT or defaults to 5000 for connection
const PORT = process.env.PORT || 5000;

// Frontend URL - uses .env FRONTEND_URL or defaults to localhost:5173 for connection
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ============================================
// DATABASE CONNECTION
// ============================================
//connect to MongoDB Atlas database using the MONGO_URI from .env.
//Imports the database connection from config/db.js.
connectDB();

// ============================================
// EXPRESS APP INITIALIZATION
// ============================================
const app = express();

// ============================================
// GLOBAL MIDDLEWARE
// ============================================
// CORS - Allows React frontend to communicate with this backend
// credentials: true enables sending cookies/auth headers
app.use(cors({ origin: FRONTEND_URL, credentials: true }));

// JSON Parser - Automatically parses JSON request bodies into req.body
app.use(express.json());

// ============================================
// ROUTES
// ============================================
app.use('/api/auth', authRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// Handle 404 - Route not found (must be after all other routes)
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.url}`
    });
});

// Global error handler (must be last)
app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend URL: ${FRONTEND_URL}`);
});