// Recipe Preference Routes - ratings, favorites, hide
const express = require('express');
const router = express.Router();
const RecipePreference = require('../models/RecipePreference');
const Recipe = require('../models/Recipe');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// ============================================
// RATE a recipe (1-5 stars)
// POST /api/recipe-preferences/:recipeId/rate
// Body: { rating: 4 }
// ============================================
router.post('/:recipeId/rate', async (req, res) => {
    try {
        const { recipeId } = req.params;
        const { rating } = req.body;
        const userId = req.user.id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Find or create preference
        let preference = await RecipePreference.findOne({ user: userId, recipe: recipeId });
        
        if (!preference) {
            preference = new RecipePreference({ user: userId, recipe: recipeId });
        }

        // Update rating
        preference.rating = rating;
        preference.updatedAt = Date.now();
        await preference.save();

        // Update recipe's average rating
        const allRatings = await RecipePreference.find({ 
            recipe: recipeId, 
            rating: { $ne: null } 
        });
        
        const totalRatings = allRatings.length;
        const sumRatings = allRatings.reduce((sum, p) => sum + p.rating, 0);
        const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

        await Recipe.findByIdAndUpdate(recipeId, {
            averageRating: Math.round(averageRating * 10) / 10,
            ratingCount: totalRatings
        });

        res.json({ 
            message: 'Rating saved', 
            rating: preference.rating,
            averageRating: Math.round(averageRating * 10) / 10,
            ratingCount: totalRatings
        });

    } catch (error) {
        console.error('Rate recipe error:', error);
        res.status(500).json({ message: error.message });
    }
});

// ============================================
// TOGGLE favorite
// POST /api/recipe-preferences/:recipeId/favorite
// ============================================
router.post('/:recipeId/favorite', async (req, res) => {
    try {
        const { recipeId } = req.params;
        const userId = req.user.id;

        let preference = await RecipePreference.findOne({ user: userId, recipe: recipeId });
        
        if (!preference) {
            preference = new RecipePreference({ user: userId, recipe: recipeId });
        }

        preference.isFavorite = !preference.isFavorite;
        preference.updatedAt = Date.now();
        await preference.save();

        res.json({ 
            message: preference.isFavorite ? 'Added to favorites' : 'Removed from favorites',
            isFavorite: preference.isFavorite 
        });

    } catch (error) {
        console.error('Toggle favorite error:', error);
        res.status(500).json({ message: error.message });
    }
});

// ============================================
// HIDE a recipe (never show again)
// POST /api/recipe-preferences/:recipeId/hide
// ============================================
router.post('/:recipeId/hide', async (req, res) => {
    try {
        const { recipeId } = req.params;
        const userId = req.user.id;

        let preference = await RecipePreference.findOne({ user: userId, recipe: recipeId });
        
        if (!preference) {
            preference = new RecipePreference({ user: userId, recipe: recipeId });
        }

        preference.isHidden = true;
        preference.updatedAt = Date.now();
        await preference.save();

        res.json({ message: 'Recipe hidden', isHidden: true });

    } catch (error) {
        console.error('Hide recipe error:', error);
        res.status(500).json({ message: error.message });
    }
});

// ============================================
// UNHIDE a recipe
// POST /api/recipe-preferences/:recipeId/unhide
// ============================================
router.post('/:recipeId/unhide', async (req, res) => {
    try {
        const { recipeId } = req.params;
        const userId = req.user.id;

        let preference = await RecipePreference.findOne({ user: userId, recipe: recipeId });
        
        if (!preference) {
            preference = new RecipePreference({ user: userId, recipe: recipeId });
        }

        preference.isHidden = false;
        preference.updatedAt = Date.now();
        await preference.save();

        res.json({ message: 'Recipe unhidden', isHidden: false });

    } catch (error) {
        console.error('Unhide recipe error:', error);
        res.status(500).json({ message: error.message });
    }
});

// ============================================
// GET user's favorite recipes
// GET /api/recipe-preferences/favorites
// ============================================
router.get('/favorites', async (req, res) => {
    try {
        const userId = req.user.id;

        const preferences = await RecipePreference.find({ 
            user: userId, 
            isFavorite: true,
            isHidden: false
        }).populate('recipe');

        const favorites = preferences
            .filter(p => p.recipe)
            .map(p => p.recipe);

        res.json(favorites);

    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ message: error.message });
    }
});

// ============================================
// GET user's rating for a specific recipe
// GET /api/recipe-preferences/:recipeId/rating
// ============================================
router.get('/:recipeId/rating', async (req, res) => {
    try {
        const { recipeId } = req.params;
        const userId = req.user.id;

        const preference = await RecipePreference.findOne({ user: userId, recipe: recipeId });

        res.json({
            rating: preference?.rating || null,
            isFavorite: preference?.isFavorite || false,
            isHidden: preference?.isHidden || false
        });

    } catch (error) {
        console.error('Get preference error:', error);
        res.status(500).json({ message: error.message });
    }
});

// ============================================
// INCREMENT times viewed for a recipe
// POST /api/recipe-preferences/:recipeId/view
// ============================================
router.post('/:recipeId/view', async (req, res) => {
    try {
        const { recipeId } = req.params;
        const userId = req.user.id;

        let preference = await RecipePreference.findOne({ user: userId, recipe: recipeId });
        
        if (!preference) {
            preference = new RecipePreference({ user: userId, recipe: recipeId });
        }

        preference.timesViewed += 1;
        preference.lastViewedAt = Date.now();
        await preference.save();

        res.json({ timesViewed: preference.timesViewed });

    } catch (error) {
        console.error('Track view error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;