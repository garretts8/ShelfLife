// Emergency Kit Item Schema - for tracking emergency preparedness supplies
const mongoose = require('mongoose');

const EmergencyKitItemSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Item name is required'],
        trim: true
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [0, 'Quantity cannot be negative'],
        default: 1
    },
    unit: {
        type: String,
        enum: ['', 'gallons', 'liters', 'bars', 'packs', 'batteries', 'rolls', 'pairs', 'boxes', 'days'],
        default: ''
    },
    category: {
        type: String,
        required: true,
        enum: ['water', 'food', 'first aid', 'tools', 'light', 'communication', 'hygiene', 'documents', 'clothing', 'other']
    },
    replacementDate: {
        type: Date,
        default: null,
        comment: 'Date when item needs to be replaced (for perishable emergency items)'
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    location: {
        type: String,
        default: '',
        comment: 'Where the item is stored (e.g., "Go-bag", "Basement", "Car")'
    },
    isEssential: {
        type: Boolean,
        default: false,
        comment: 'Mark as essential for quick reference'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for efficient querying
EmergencyKitItemSchema.index({ user: 1, category: 1 });
EmergencyKitItemSchema.index({ user: 1, replacementDate: 1 });

module.exports = mongoose.model('EmergencyKitItem', EmergencyKitItemSchema);