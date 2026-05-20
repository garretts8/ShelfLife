//Recipe routes - CRUD and matching endpoints
const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const { protect } = require('../middleware/authMiddleware');
const { getRecipeSuggestions, matchRecipesToExpiringItems } = require('../services/recipeMatchingService');
const PantryItem = require('../models/PantryItem');
const User = require('../models/User');

//All routes require authentication
// Public debug route: get suggestions for a user by email (development only)
router.get('/debug-suggestions', async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'production') return res.status(403).json({ message: 'Not allowed' });
        const { email } = req.query;
        if (!email) return res.status(400).json({ message: 'Email query param required' });
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });
        const suggestions = await getRecipeSuggestions(user._id);
        res.json(suggestions);
    } catch (error) {
        console.error('Debug suggestions error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Development-only: list expiring pantry items for a user by email
router.get('/debug-items', async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'production') return res.status(403).json({ message: 'Not allowed' });
        const { email } = req.query;
        if (!email) return res.status(400).json({ message: 'Email query param required' });
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        today.setUTCHours(0,0,0,0);
        nextWeek.setUTCHours(23,59,59,999);

        const items = await PantryItem.find({ user: user._id, expirationDate: { $gte: today, $lte: nextWeek } });
        res.json({ count: items.length, items });
    } catch (error) {
        console.error('Debug items error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Development-only: list recipes (no auth) to verify seed data
router.get('/debug-recipes', async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'production') return res.status(403).json({ message: 'Not allowed' });
        const recipes = await Recipe.find().limit(50);
        res.json({ count: recipes.length, recipes: recipes.slice(0, 10) });
    } catch (error) {
        console.error('Debug recipes error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Development-only: seed initial recipes from data/recipes.json (no auth)
router.post('/seed', async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({ message: 'Not allowed in production' });
        }
        const recipes = require('../data/recipes.json');
        await Recipe.deleteMany({}); // Clear existing recipes
        await Recipe.insertMany(recipes);
        res.json({ message: `${recipes.length} recipes seeded successfully` });
    } catch (error) {
        console.error('Error seeding recipes (dev):', error);
        res.status(500).json({ message: error.message });
    }
});

// All other routes require authentication
router.use(protect);

// ============================================
// GET /api/recipes/suggestions - Get recipe suggestions based on expiring items
// ============================================
router.get('/suggestions', async (req, res) => {
    try {
        const suggestions = await getRecipeSuggestions(req.user._id);
        res.json(suggestions);
    } catch (error) {
        console.error('Error getting suggestions:', error);
        res.status(500).json({ message: error.message });
    }
});

// ============================================
// GET /api/recipes - Get all recipes
// ============================================

router.get('/', async (req, res) => {
    try {
        const recipes = await Recipe.find();
        res.json(recipes);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ message: error.message });
    }
});

// Development-only: list recipes (no auth) to verify seed data
router.get('/debug-recipes', async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'production') return res.status(403).json({ message: 'Not allowed' });
        const recipes = await Recipe.find().limit(50);
        res.json({ count: recipes.length, recipes: recipes.slice(0, 10) });
    } catch (error) {
        console.error('Debug recipes error:', error);
        res.status(500).json({ message: error.message });
    }
});

// ============================================
// GET /api/recipes/:id - Get single recipe by ID
// ============================================

router.get('/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.json(recipe);
    } catch (error) {
        console.error('Error fetching recipe:', error);
        res.status(500).json({ message: error.message });
    }
});

// ============================================
// POST /api/recipes/seed - Seed initial recipes (development only)
// ============================================
router.post('/seed', async (req, res) => {
    try {
        //Only allow in development
        if (process.env.NODE_ENV !== 'production') {
            return res.status(403).json({ message: 'Not allowed in production' });
        }

        const recipes = require('../data/recipes.json');
        await Recipe.deleteMany({}); // Clear existing recipes
        await Recipe.insertMany(recipes);

        res.json({ message: `${recipes.length} recipes seeded successfully` });
    } catch (error) {
        console.error('Error seeding recipes:', error);
        res.status(500).json({ message: error.message });   
    }
});

// ============================================
// POST /api/recipes - Create custom recipe
// ============================================

router.post('/', async (req, res) => {
    try {
        const recipe = new Recipe({
            ...req.body,
            createdBy: req.user.id,
            isSystemRecipe: false
        });
        await recipe.save();
        res.status(201).json(recipe);
    } catch (error) {
        console.error('Error creating recipe:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;