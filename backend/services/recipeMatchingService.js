//Recipe matching engine - matches expiring items to recipes
const Recipe = require('../models/Recipe');

const RecipePreference = require('../models/RecipePreference');


// Normalize ingredient name for matching (remove plurals, common words)
const normalizeIngredient = (ingredient) => {
    if (!ingredient) return '';
    
    let normalized = ingredient.toLowerCase().trim();
    
    // Remove common words
    normalized = normalized.replace(/canned|fresh|frozen|organic|whole|ground|shredded|diced|sliced|minced/g, '');
    
    // Remove plurals (simple approach)
    if (normalized.endsWith('ies')) {
        normalized = normalized.slice(0, -3) + 'y';
    } else if (normalized.endsWith('es') && !normalized.endsWith('cheese') && !normalized.endsWith('lettuce')) {
        normalized = normalized.slice(0, -2);
    } else if (normalized.endsWith('s') && !normalized.endsWith('rice') && !normalized.endsWith('beans')) {
        normalized = normalized.slice(0, -1);
    }
    
    // Remove extra spaces
    normalized = normalized.replace(/\s+/g, ' ').trim();
    
    return normalized;
};

// Check if an expiring item matches a recipe ingredient
const ingredientMatches = (expiringItem, recipeIngredient) => {
    const expiringNormalized = normalizeIngredient(expiringItem.name);
    const ingredientNormalized = normalizeIngredient(recipeIngredient.name);
    
    // Exact match
    if (expiringNormalized === ingredientNormalized) return true;
    
    // Partial match (e.g., "tomato" matches "tomatoes")
    if (expiringNormalized.includes(ingredientNormalized) || 
        ingredientNormalized.includes(expiringNormalized)) return true;
    
    // Common substitutions map
    const substitutions = {
        'tomato': ['tomatoes', 'cherry tomato', 'roma tomato', 'canned tomato'],
        'onion': ['onions', 'yellow onion', 'red onion', 'white onion'],
        'garlic': ['garlic cloves', 'minced garlic'],
        'bell pepper': ['pepper', 'capsicum', 'green pepper', 'red pepper'],
        'chicken': ['chicken breast', 'chicken thigh', 'chicken tender'],
        'beans': ['black beans', 'kidney beans', 'pinto beans', 'canned beans'],
        'rice': ['white rice', 'brown rice', 'jasmine rice'],
        'pasta': ['spaghetti', 'macaroni', 'noodles', 'penne'],
        'milk': ['whole milk', 'skim milk', '2% milk'],
        'cheese': ['cheddar', 'mozzarella', 'parmesan', 'shredded cheese']
    };
    
    // Check substitutions
    for (const [key, values] of Object.entries(substitutions)) {
        if (expiringNormalized === key && values.includes(ingredientNormalized)) return true;
        if (ingredientNormalized === key && values.includes(expiringNormalized)) return true;
        if (values.includes(expiringNormalized) && values.includes(ingredientNormalized)) return true;
    }
    
    return false;
};

// Match expiring items to recipes
const matchRecipesToExpiringItems = async (expiringItems) => {
    if (!expiringItems || expiringItems.length === 0) {
        return [];
    }
    
    // Get all recipes from database
    const allRecipes = await Recipe.find();
    
    if (allRecipes.length === 0) {
        return [];
    }
    
    // Calculate match score for each recipe (defensive: handle malformed recipes)
    const recipesWithScores = allRecipes.map(recipe => {
        let matchCount = 0;
        const matchedIngredients = [];
        // Ensure ingredients is an array
        const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];

        // Check each expiring item against recipe ingredients
        for (const expiringItem of expiringItems) {
            for (const recipeIngredient of ingredients) {
                // guard against malformed ingredient objects
                const ri = recipeIngredient || {};
                if (ingredientMatches(expiringItem, ri)) {
                    matchCount++;
                    matchedIngredients.push({
                        expiringItem: expiringItem.name || '',
                        recipeIngredient: ri.name || ''
                    });
                    break; // Count each expiring item once per recipe
                }
            }
        }

        const recipeObj = recipe.toObject ? recipe.toObject() : { ...recipe };
        return {
            ...recipeObj,
            matchCount,
            matchedIngredients,
            matchScore: matchCount / Math.max(ingredients.length, 1) // Percentage of recipe matched
        };
    });
    
    // Filter to recipes with at least 1 match, sort by match count (highest first)
    return recipesWithScores
        .filter(recipe => recipe.matchCount > 0)
        .sort((a, b) => b.matchCount - a.matchCount)
        .slice(0, 5); // Top 5 suggestions
};

// Update the getRecipeSuggestions function
const getRecipeSuggestions = async (userId) => {
    try {
        // Get expiring items for this user (within 7 days)
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        today.setUTCHours(0, 0, 0, 0);
        nextWeek.setUTCHours(23, 59, 59, 999);
        
        const PantryItem = require('../models/PantryItem');
        const expiringItems = await PantryItem.find({
            user: userId,
            expirationDate: { $gte: today, $lte: nextWeek }
        });
        
        if (expiringItems.length === 0) {
            return [];
        }
        
        // Get user's hidden recipes
        const hiddenPreferences = await RecipePreference.find({ 
            user: userId, 
            isHidden: true 
        });
        const hiddenRecipeIds = hiddenPreferences.map(p => p.recipe.toString());
        
        // Get user's favorite recipes (to prioritize)
        const favoritePreferences = await RecipePreference.find({ 
            user: userId, 
            isFavorite: true 
        });
        const favoriteRecipeIds = favoritePreferences.map(p => p.recipe.toString());
        
        // Get matched recipes
        let matchedRecipes = await matchRecipesToExpiringItems(expiringItems);
        
        // Filter out hidden recipes
        matchedRecipes = matchedRecipes.filter(recipe => 
            !hiddenRecipeIds.includes(recipe._id.toString())
        );
        
        // Sort: favorites first, then by match count
        matchedRecipes.sort((a, b) => {
            const aIsFavorite = favoriteRecipeIds.includes(a._id.toString());
            const bIsFavorite = favoriteRecipeIds.includes(b._id.toString());
            
            if (aIsFavorite && !bIsFavorite) return -1;
            if (!aIsFavorite && bIsFavorite) return 1;
            return b.matchCount - a.matchCount;
        });
        
        return matchedRecipes.slice(0, 5);
        
    } catch (error) {
        console.error('Error getting recipe suggestions:', error);
        return [];
    }
};

module.exports = {
    matchRecipesToExpiringItems,
    getRecipeSuggestions,
    normalizeIngredient,
    ingredientMatches
};