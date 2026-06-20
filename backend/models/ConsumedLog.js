const mongoose = require('mongoose');

const ConsumedLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    itemName: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        default: ''
    },
    expirationDate: {
        type: Date
    },
    consumedAt: {
        type: Date,
        default: Date.now
    },
    reason: {
        type: String,
        enum: ['consumed', 'expired', 'donated', 'other'],
        default: 'consumed'
    }
});

// Index for efficient queries
ConsumedLogSchema.index({ user: 1, consumedAt: -1 });

module.exports = mongoose.model('ConsumedLog', ConsumedLogSchema);