//Loads environment variables from .env file into process.env
require('dotenv').config();
//Web Framework for Node.js, used to build the server.
const express = require('express');
//CORS - Allows React frontend to communicate with this backend
const cors = require('cors');
//Imports the database connection from config/db.js.
const connectDB = require('./config/db');
//Imports the authentication routes from authRoutes.js
const authRoutes = require('./routes/authRoutes');
//Imports the pantry routes from pantryRoutes.js
const pantryRoutes = require('./routes/pantryRoutes');
//Imports the notification routes from notificationRoutes.js
const notificationRoutes = require('./routes/notificationRoutes');
//Imports the cron job functionality from cronService.js
const { initCronJobs } = require('./services/cronService');
//Imports the preferences routes from preferencesRoutes.js
const preferencesRoutes = require('./routes/preferenceRoutes');

// ============================================
// CONFIGURATION
// ============================================
// Backend (Server) PORT or defaults to 5000 for connection
const PORT = process.env.PORT || 5000;

// Frontend URL - uses .env FRONTEND_URL or defaults to localhost:5173 for connection
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ============================================
// DATABASE CONNECTION
// ============================================
//connect to MongoDB Atlas database using the MONGO_URI from .env.
//Imports the database connection from config/db.js.
connectDB();

//Initialize cron jobs for scheduled tasks
initCronJobs();

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
//Used for the authentication and user management functionality
app.use('/api/auth', authRoutes);
//Used for the pantry functionality(Pantry endpoints)
app.use('/api/pantry', pantryRoutes);
//Used for the notification functionality
app.use('/api/notifications', notificationRoutes);
//Used for the preferences functionality
app.use('/api/preferences', preferencesRoutes);

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