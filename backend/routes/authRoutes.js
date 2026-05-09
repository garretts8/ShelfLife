//Handles all authentication routes and requests. 
// Handles all registration, login, and Google OAuth related requests

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
//Import User model
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

// Create Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

//Helper function to create JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ============================================
// EMAIL/PASSWORD AUTHENTICATION 
// ============================================
// Create user in the database after registration
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        //Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        //Create new user in database
        const user = await User.create({ name, email, password });

        res.status(201).json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user.id) });
    } catch (error) { res.status(500).json({ message: 'error.message' }); }
});

//Find user in database and compare passwords
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        //Query database to find user with the matching email
        const user = await User.findOne({ email });
        //Compare the entered password with the hashed password
        if (user && (await user.matchPassword(password))) {
            res.json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user.id) });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) { res.status(500).json({ message: 'error.message' }); }
});


// ============================================
// GOOGLE OAUTH AUTHENTICATION (NEW)
// ============================================

/**
 * Google OAuth endpoint
 * Receives the Google token from frontend, verifies it, and returns a JWT
 */

router.post('/google', async (req, res) => {
    try {
        const { token } = req.body;

        console.log('=== GOOGLE ENDPOINT HIT ===');
        console.log('Token received:', token ? 'Yes (first 50 chars): ' + token.substring(0, 50) : 'NO TOKEN');

        if (!token) {
            console.error('No token provided');
            return res.status(400).json({ message: 'No token provided' });
        }

        // Verify the Google ID token
        console.log('Verifying Google ID token...');
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        console.log('Google user info received:', { email: payload.email, name: payload.name });

        // Extract variables from payload
        const { email, name, sub: googleId, picture } = payload;

        // Find or create user in database
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user for Google login
            user = await User.create({
                name: name,
                email: email,
                googleId: googleId,
                password: null,
                profilePicture: picture
            });
            console.log(`New user created via Google: ${email}`);
        } else if (!user.googleId) {
            // Existing email user is now linking their Google account
            user.googleId = googleId;
            user.profilePicture = picture;
            await user.save();
            console.log(`🔗 Google account linked to existing user: ${email}`);
        }

        // Generate JWT for the app
        const jwtToken = generateToken(user._id);

        res.json({
            token: jwtToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        require('fs').writeFileSync('last_google_error.txt', error.stack || error.message);
        console.error('Google verification error:', error);
        res.status(401).json({
            message: 'Invalid Google token',
            details: error.message
        });
    }
});

/**
 * Get current user profile (using JWT token from Authorization header)
 */
router.get('/profile', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('name email profilePicture createdAt');

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        res.json(user);
    } catch (error) {
        require('fs').writeFileSync('last_profile_error.txt', error.stack || error.message);
        console.error('Profile error:', error.stack || error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' })
        }
        res.status(500).json({ message: 'Server error', details: error.message })
    }
});

module.exports = router;