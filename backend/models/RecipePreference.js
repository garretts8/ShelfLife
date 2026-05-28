// Recipe Preference Schema - stores user interactions with recipes
const mongoose = require('mongoose');

const RecipePreferenceSchema = new mongoose.Schema({    
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
        required: true
    },
    rating: {
        type: Number,
        min: 1, 
        max: 5,
        default: null
    },
    isFavorite: {
        type: Boolean,
        default: false
    },
    isHidden: {
        type: Boolean,
        default: false
    },
    timesViewed: {
        type: Number,
        default: 0
    },
    lastViewedAt: {
        type: Date,
        default: null
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

// Compound index for efficient lookups
RecipePreferenceSchema.index({ user: 1, recipe: 1 }, { unique: true });
RecipePreferenceSchema.index({ user: 1, isFavorite: 1 });
RecipePreferenceSchema.index({ user: 1, isHidden: 1 });

module.exports = mongoose.model('RecipePreference', RecipePreferenceSchema);