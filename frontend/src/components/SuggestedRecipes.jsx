import React, { useState, useEffect } from 'react';
import api from '../api';
import './SuggestedRecipes.css';

const SuggestedRecipes = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecipe, setSelectedRecipe] = useState(null);

    useEffect(() => {
        loadSuggestions();
    }, []);

    const loadSuggestions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/recipes/suggestions');
            setSuggestions(response.data);
        } catch (error) {
            console.error('Failed to load suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRating = async (recipeId, rating) => {
        try {
            await api.post(`/recipe-preferences/${recipeId}/rate`, { rating });
            loadSuggestions();
        } catch (error) {
            console.error('Failed to rate recipe:', error);
        }
    };

    const handleFavorite = async (recipeId) => {
        try {
            await api.post(`/recipe-preferences/${recipeId}/favorite`);
            loadSuggestions();
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        }
    };

    const handleHide = async (recipeId) => {
        if (window.confirm('Hide this recipe? You can unhide it later.')) {
            try {
                await api.post(`/recipe-preferences/${recipeId}/hide`);
                loadSuggestions();
            } catch (error) {
                console.error('Failed to hide recipe:', error);
            }
        }
    };

    if (loading) return <div className="loading-suggestions">Finding recipes based on your expiring items...</div>;

    if (suggestions.length === 0) {
        return (
            <div className="suggested-recipes empty">
                <h2>💡 Suggested Recipes</h2>
                <p>No suggestions yet. Add items to your pantry that are about to expire to see recipes you can make!</p>
            </div>
        );
    }

    return (
        <div className="suggested-recipes">
            <h2>💡 Suggested Recipes</h2>
            <p className="suggested-subtitle">Based on items expiring soon in your pantry</p>

            <div className="suggestions-list">
                {suggestions.map(recipe => (
                    <div key={recipe._id} className="suggestion-card">
                        <div className="suggestion-header">
                            <h3>{recipe.name}</h3>
                            <div className="suggestion-badges">
                                <span className="match-badge">{recipe.matchCount} ingredient match</span>
                                <button 
                                    className="favorite-btn"
                                    onClick={() => handleFavorite(recipe._id)}
                                >
                                    ☆
                                </button>
                                <button 
                                    className="hide-btn"
                                    onClick={() => handleHide(recipe._id)}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        <p className="suggestion-description">{recipe.description}</p>
                        <div className="suggestion-meta">
                            <span>⏱️ {recipe.prepTime + recipe.cookTime} min</span>
                            <span>🍽️ {recipe.servings} servings</span>
                        </div>
                        <div className="rating-stars">
                            {[1, 2, 3, 4, 5].map(star => (
                                <span key={star} className="star" onClick={() => handleRating(recipe._id, star)}>★</span>
                            ))}
                        </div>
                        <button 
                            className="view-btn"
                            onClick={() => setSelectedRecipe(selectedRecipe === recipe._id ? null : recipe._id)}
                        >
                            {selectedRecipe === recipe._id ? 'Hide Recipe' : 'View Recipe'}
                        </button>
                        {selectedRecipe === recipe._id && (
                            <div className="recipe-details">
                                <h4>Matched Ingredients:</h4>
                                <ul className="matched-list">
                                    {recipe.matchedIngredients?.map((match, i) => (
                                        <li key={i}>✅ {match.expiringItem}</li>
                                    ))}
                                </ul>
                                <h4>All Ingredients:</h4>
                                <ul>
                                    {recipe.ingredients?.map((ing, i) => (
                                        <li key={i}>{ing.quantity} {ing.unit} {ing.name}</li>
                                    ))}
                                </ul>
                                <h4>Instructions:</h4>
                                <p>{recipe.instructions}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SuggestedRecipes;
