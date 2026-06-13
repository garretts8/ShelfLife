//Routes for testing email notifications

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { sendTestEmail } = require('../services/brevoEmailService');
const { checkAndNotifyExpiringItems } = require('../services/cronService');


// Test email endpoint - sends a test email to verify setup
//POST /api/notifications/test-email
router.post('/test-email', protect, async (req, res) => {
    try {
        const user = req.user;
        const success = await sendTestEmail(user.email, user.name);

        if (success) {
            res.json({ message: 'Test email sent successfully!' })
        } else {
            res.status(500).json({ message: 'Failed to send test email  ' })
        }
    } catch (error) {
        console.error('Test email error: ', error);
        res.status(500).json({ message: error.message });
    }
});

//Manual trigger for expiration check for testing
router.post('/manual-check', protect, async (req, res) => {
    try {
        //Only allow this in development
        if (process.env.NODE_ENV !== 'production') {
            await checkAndNotifyExpiringItems();
            res.json({ message: 'Manual expiration check triggered' });
        } else {
            res.status(403).json({ message: 'Not allowed in production' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
