// RecipeSuggestions.jsx
/*React component that fetches and displays recipe suggestions 
based on expiring items in the user's pantry. 
It shows matched ingredients, preparation time, and allows users 
to view detailed recipe instructions. 
This component helps users make the most of their food before 
it goes to waste. */
import React, { useState, useEffect } from 'react';
import api from '../api';
import './RecipeSuggestions.css';

const RecipeSuggestions = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [userRatings, setUserRatings] = useState({});
    const [favorites, setFavorites] = useState({});

    useEffect(() => {
        loadSuggestions();
    }, []);

    const loadSuggestions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/recipes/suggestions');
            setSuggestions(response.data);
            
            // Load user preferences for displayed recipes
            for (const recipe of response.data) {
                const prefResponse = await api.get(`/recipe-preferences/${recipe._id}/rating`);
                setUserRatings(prev => ({ ...prev, [recipe._id]: prefResponse.data.rating }));
                setFavorites(prev => ({ ...prev, [recipe._id]: prefResponse.data.isFavorite }));
            }
        } catch (error) {
            console.error('Failed to load recipe suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRating = async (recipeId, rating) => {
        try {
            await api.post(`/recipe-preferences/${recipeId}/rate`, { rating });
            setUserRatings(prev => ({ ...prev, [recipeId]: rating }));
        } catch (error) {
            console.error('Failed to rate recipe:', error);
        }
    };

    const handleFavorite = async (recipeId) => {
        try {
            const response = await api.post(`/recipe-preferences/${recipeId}/favorite`);
            setFavorites(prev => ({ ...prev, [recipeId]: response.data.isFavorite }));
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        }
    };

    const handleHide = async (recipeId) => {
        if (window.confirm('Hide this recipe? You can unhide it later from your settings.')) {
            try {
                await api.post(`/recipe-preferences/${recipeId}/hide`);
                // Remove from suggestions
                setSuggestions(prev => prev.filter(r => r._id !== recipeId));
            } catch (error) {
                console.error('Failed to hide recipe:', error);
            }
        }
    };

    const handleViewRecipe = async (recipe) => {
        if (selectedRecipe?._id === recipe._id) {
            setSelectedRecipe(null);
        } else {
            setSelectedRecipe(recipe);
            // Track view
            await api.post(`/recipe-preferences/${recipe._id}/view`);
        }
    };

    const renderStars = (recipeId, currentRating) => {
        return (
            <div className="rating-stars">
                {[1, 2, 3, 4, 5].map(star => (
                    <span
                        key={star}
                        className={`star ${star <= (userRatings[recipeId] || currentRating) ? 'filled' : ''}`}
                        onClick={() => handleRating(recipeId, star)}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    if (loading) {
        return <div className="recipe-loading">Finding recipe suggestions...</div>;
    }

    if (suggestions.length === 0) {
        return (
            <div className="recipe-card">
                <h2>🍳 Recipe Suggestions</h2>
                <p className="no-suggestions">
                    No recipe suggestions yet. Add items to your pantry that are about to expire 
                    to see recipes you can make!
                </p>
            </div>
        );
    }

    return (
        <div className="recipe-card">
            <h2>🍳 Recipe Suggestions</h2>
            <p className="recipe-subtitle">
                Based on items expiring soon in your pantry
            </p>
            
            <div className="recipe-list">
                {suggestions.map((recipe) => (
                    <div key={recipe._id} className={`recipe-item ${favorites[recipe._id] ? 'favorite' : ''}`}>
                        <div className="recipe-header">
                            <div className="recipe-title">
                                <h3>{recipe.name}</h3>
                                {favorites[recipe._id] && <span className="favorite-badge">⭐ Favorite</span>}
                            </div>
                            <span className="match-badge">
                                {recipe.matchCount} ingredient{recipe.matchCount !== 1 ? 's' : ''} match
                            </span>
                        </div>
                        
                        <div className="recipe-meta-row">
                            <div className="recipe-meta">
                                <span>⏱️ {recipe.prepTime + recipe.cookTime} min</span>
                                <span>🍽️ {recipe.servings} servings</span>
                                {recipe.averageRating > 0 && (
                                    <span>⭐ {recipe.averageRating} ({recipe.ratingCount} ratings)</span>
                                )}
                            </div>
                            
                            <div className="recipe-actions">
                                {renderStars(recipe._id, recipe.userRating)}
                                <button 
                                    className={`favorite-btn ${favorites[recipe._id] ? 'active' : ''}`}
                                    onClick={() => handleFavorite(recipe._id)}
                                    title={favorites[recipe._id] ? 'Remove from favorites' : 'Add to favorites'}
                                >
                                    {favorites[recipe._id] ? '⭐' : '☆'}
                                </button>
                                <button 
                                    className="hide-btn"
                                    onClick={() => handleHide(recipe._id)}
                                    title="Don't show this recipe again"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        
                        <p className="recipe-description">{recipe.description}</p>
                        
                        <button 
                            className="view-recipe-btn"
                            onClick={() => handleViewRecipe(recipe)}
                        >
                            {selectedRecipe?._id === recipe._id ? 'Hide Recipe' : 'View Recipe'}
                        </button>
                        
                        {selectedRecipe?._id === recipe._id && (
                            <div className="recipe-details">
                                <h4>Matched Ingredients:</h4>
                                <ul className="matched-ingredients">
                                    {recipe.matchedIngredients && recipe.matchedIngredients.map((match, i) => (
                                        <li key={i}>
                                            ✅ {match.expiringItem} → used as {match.recipeIngredient}
                                        </li>
                                    ))}
                                </ul>
                                
                                <h4>All Ingredients:</h4>
                                <ul className="ingredients-list">
                                    {recipe.ingredients && recipe.ingredients.map((ing, i) => (
                                        <li key={i}>
                                            {ing.quantity} {ing.unit} {ing.name}
                                        </li>
                                    ))}
                                </ul>
                                
                                <h4>Instructions:</h4>
                                <p className="instructions">{recipe.instructions}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecipeSuggestions;