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
//Imports the recipe routes from recipeRoutes.js
const recipeRoutes = require('./routes/recipeRoutes');
//Imports the emergency kit routes from emergencyKitRoutes.js
const emergencyKitRoutes = require('./routes/emergencyKitRoutes');
const recipePreferenceRoutes = require('./routes/recipePreferenceRoutes');
const consumedLogRoutes = require('./routes/consumedLogRoutes');

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

const startServer = async () => {
    await connectDB();
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
    // Allow additional localhost origins during development so Vite can talk to the API
    const allowedOrigins = [FRONTEND_URL];
    if (process.env.NODE_ENV !== 'production') {
        allowedOrigins.push('http://localhost:5173', 'http://localhost:5174');
    }
    app.use(cors({ origin: allowedOrigins, credentials: true }));

    // JSON Parser - Automatically parses JSON request bodies into req.body
    app.use(express.json());

    // Serve static files (privacy policy, terms, etc.)  ← ADD THIS LINE HERE
    app.use(express.static('public'));

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
    //Used for the recipe functionality
    app.use('/api/recipes', recipeRoutes);
    app.get('/', (req, res) => {
        res.json({
            message: 'Welcome to ShelfLife API',
            version: '1.0.0',
            endpoints: {
                auth: '/api/auth',
                pantry: '/api/pantry',
                notifications: '/api/notifications',
                preferences: '/api/preferences'
            },
            status: 'running'
        });
    });

    app.get('/privacy-policy', (req, res) => {
        res.json({
            title: "ShelfLife Privacy Policy",
            effectiveDate: "May 18, 2026",
            sections: {
                informationCollected: "We collect name, email, pantry items, and phone number (if you opt-in to SMS).",
                howWeUseInfo: "To display your pantry, send expiration alerts via email/SMS, and improve the app.",
                smsNotifications: "You opt-in by checking the SMS box in settings. Reply STOP to unsubscribe. Msg & data rates may apply.",
                dataSharing: "We do NOT sell or share your personal information with third parties for marketing.",
                contact: "Email gar21085@byui.edu for privacy concerns."
            }
        });
    });
    //Used for the emergency kit functionality
    app.use('/api/emergency-kit', emergencyKitRoutes);
    app.use('/api/recipe-preferences', recipePreferenceRoutes);
    app.use('/api/consumed-logs', consumedLogRoutes);

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
};

startServer();

