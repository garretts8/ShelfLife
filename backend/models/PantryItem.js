const mongoose = require('mongoose');

//Defines how pantry data is structured and stored in the database
const PantryItemSchema = new mongoose.Schema({
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
        enum: ['', 'cans', 'lbs', 'oz', 'packages', 'bottles', 'boxes', 'pieces'],
        default: ''
    },
    category: {
        type: String,
        required: true,
        enum: ['canned', 'dry', 'dairy', 'produce', 'meat', 'frozen', 'beverage', 'spices', 'other']
    },

    expirationDate: {
        type: Date,
        required: [true, 'Expiration date is required']
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }, 
    notifiedForExpiration: {
        type: Boolean,
        default: false
    },
    lastNotifiedAt: {
        type: Date,
        default: null
}
});

// Indexes for efficient querying
PantryItemSchema.index({ user: 1, expirationDate: 1 });
PantryItemSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('PantryItem', PantryItemSchema);