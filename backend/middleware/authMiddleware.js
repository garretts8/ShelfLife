const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // Check if this is a Google OAuth request - skip middleware
    if (req.path === '/google' || req.path === '/register' || req.path === '/login') {
        return next();
    }

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token (this is the app's JWT, not Google's)
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token (exclude password)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            next();
        } catch (error) {
            console.error('Auth middleware error:', error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };