//Routes for user notification preferences
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const UserPreference = require('../models/UserPreference');


//Get user notification preferences
router.get('/', protect, async (req, res) => {
    try {
        let preferences = await UserPreference.findOne({ user: req.user.id });

        if (!preferences) {
            //Create default preferences if not found
            preferences = await UserPreference.create({
                user: req.user.id,
                emailNotifications: true,
                smsNotifications: false,
                phoneNumber: '',
                reminderDays: 7
            });

        }
        //Return preferences
        res.json(preferences);
    } catch (error) {
        console.error('Get preferences error:', error);
        res.status(500).json({ message: error.message });
    }
});

//Update user notification preferences
router.put('/', protect, async (req, res) => {
    try {
        const { emailNotifications, smsNotifications, phoneNumber, reminderDays } = req.body;

        let preferences = await UserPreference.findOne({ user: req.user.id });

        if (!preferences) {
            //Create default preferences if not found
            preferences = new UserPreference({ user: req.user.id });
        }

        if (emailNotifications !== undefined) preferences.emailNotifications = emailNotifications;
        if (smsNotifications !== undefined) preferences.smsNotifications = smsNotifications;
        if (phoneNumber !== undefined) preferences.phoneNumber = phoneNumber;
        if (reminderDays !== undefined) preferences.reminderDays = reminderDays;

        await preferences.save();
        res.json(preferences);

    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({ message: error.message });
    }

});
//Test SMS endpoint
router.post('/test-sms', protect, async (req, res) => {
    try {
        const preferences = await UserPreference.findOne({ user: req.user.id });

        if (!preferences || !preferences.phoneNumber) {
            return res.status(400).json({ message: 'No phone number configured' });
        }

        const { sendTestSMS } = require('../services/smsService');
        const success = await sendTestSMS(preferences.phoneNumber);

        if (success) {
            res.json({ message: 'Test SMS sent successfully!' });
        } else {
            let errorMsg = 'Failed to send test SMS';
            try {
                errorMsg = require('fs').readFileSync('last_sms_error.txt', 'utf8');
            } catch (e) {}
            res.status(500).json({ message: errorMsg });
        }

    } catch (error) {
        console.error('Test SMS error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;