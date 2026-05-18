//User preferences schema
/*Stores user preferences for email and SMS (Short Message Service) 
notifications for expiring items. */
const mongoose = require('mongoose');

const UserPreferenceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    emailNotifications: {
        type: Boolean,
        default: true
    },
    smsNotifications: {
        type: Boolean,
        default: false
    },
    phoneNumber: {
        type: String,
        default: ''
    },
    reminderDays: {
        type: Number,
        //Number of days before expiration to send reminder
        default: 7
    }
});

module.exports = mongoose.model('UserPreference', UserPreferenceSchema);