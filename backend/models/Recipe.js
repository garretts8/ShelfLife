// Recipe schema for storing recipes and ingredients
const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        default: ''
    },
    ingredients: [{
        name: {
            type: String,
            required: true
        },
        quantity: String,
        unit: String
    }],
    instructions: {
        type: String,
        default: ''
    },
    prepTime: {
        type: Number, // minutes
        default: 0
    },
    cookTime: {
        type: Number, // minutes
        default: 0
    },
    servings: {
        type: Number,
        default: 4
    },
    imageUrl: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'side'],
        default: 'dinner'
    },
    tags: [{
        type: String
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // null = system recipe
    },
    isSystemRecipe: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    ratingCount: {
        type: Number,
        default: 0
    }
});

// Index for efficient ingredient searching
RecipeSchema.index({ 'ingredients.name': 1 });

module.exports = mongoose.model('Recipe', RecipeSchema);