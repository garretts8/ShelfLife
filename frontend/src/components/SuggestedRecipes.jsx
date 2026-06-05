import React, { useState, useEffect } from 'react';
import api from '../api';
import './SuggestedRecipes.css';

const SuggestedRecipes = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [hiddenRecipes, setHiddenRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [userRatings, setUserRatings] = useState({});
    const [favorites, setFavorites] = useState({});
    const [showHidden, setShowHidden] = useState(false);

    useEffect(() => {
        loadSuggestions();
        loadHiddenRecipes();
    }, []);

    const loadSuggestions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/recipes/suggestions');
            setSuggestions(response.data);
            
            for (const recipe of response.data) {
                try {
                    const prefResponse = await api.get(`/recipe-preferences/${recipe._id}/rating`);
                    setUserRatings(prev => ({ ...prev, [recipe._id]: prefResponse.data.rating }));
                    setFavorites(prev => ({ ...prev, [recipe._id]: prefResponse.data.isFavorite }));
                } catch (err) {
                    // No preferences yet
                }
            }
        } catch (error) {
            console.error('Failed to load suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadHiddenRecipes = async () => {
        try {
            const response = await api.get('/recipe-preferences/hidden');
            setHiddenRecipes(response.data);
        } catch (error) {
            console.error('Failed to load hidden recipes:', error);
        }
    };

    const handleRating = async (recipeId, rating) => {
        try {
            await api.post(`/recipe-preferences/${recipeId}/rate`, { rating });
            setUserRatings(prev => ({ ...prev, [recipeId]: rating }));
            loadSuggestions();
        } catch (error) {
            console.error('Failed to rate recipe:', error);
        }
    };

    const handleFavorite = async (recipeId) => {
        try {
            const response = await api.post(`/recipe-preferences/${recipeId}/favorite`);
            setFavorites(prev => ({ ...prev, [recipeId]: response.data.isFavorite }));
            loadSuggestions();
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        }
    };

    const handleHide = async (recipeId) => {
        if (window.confirm('Hide this recipe? You can unhide it later from the "Hidden Recipes" section.')) {
            try {
                await api.post(`/recipe-preferences/${recipeId}/hide`);
                loadSuggestions();
                loadHiddenRecipes();
            } catch (error) {
                console.error('Failed to hide recipe:', error);
            }
        }
    };

    const handleUnhide = async (recipeId) => {
        try {
            await api.post(`/recipe-preferences/${recipeId}/unhide`);
            loadSuggestions();
            loadHiddenRecipes();
        } catch (error) {
            console.error('Failed to unhide recipe:', error);
        }
    };

    const renderStars = (recipeId) => {
        const currentRating = userRatings[recipeId] || 0;
        
        return (
            <div className="rating-stars">
                {[1, 2, 3, 4, 5].map(star => (
                    <span 
                        key={star} 
                        className={`star ${star <= currentRating ? 'filled' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRating(recipeId, star);
                        }}
                    >
                        ★
                    </span>
                ))}
                {currentRating > 0 && (
                    <span className="rating-text">({currentRating}/5)</span>
                )}
            </div>
        );
    };

    if (loading) return <div className="loading-suggestions">Finding recipes based on your expiring items...</div>;

    return (
        <div className="suggested-recipes">
            <h2>💡 Suggested Recipes</h2>
            
            {/* Subtitle with button on the right */}
            <div className="suggested-subtitle-row">
                <p className="suggested-subtitle">Based on items expiring soon in your pantry</p>
                {hiddenRecipes.length > 0 && (
                    <button 
                        className="toggle-hidden-btn"
                        onClick={() => setShowHidden(!showHidden)}
                    >
                        {showHidden ? 'Hide Hidden Recipes' : `Show Hidden (${hiddenRecipes.length})`}
                    </button>
                )}
            </div>

            {/* Hidden Recipes Section */}
            {showHidden && hiddenRecipes.length > 0 && (
                <div className="hidden-recipes-section">
                    <h3>🙈 Hidden Recipes</h3>
                    <p className="hidden-note">These recipes are hidden from your suggestions. Click "Unhide" to bring them back.</p>
                    <div className="suggestions-list">
                        {hiddenRecipes.map(recipe => (
                            <div key={recipe._id} className="suggestion-card hidden">
                                <div className="suggestion-header">
                                    <div className="suggestion-title">
                                        <h3>{recipe.name}</h3>
                                    </div>
                                    <div className="suggestion-badges">
                                        <button 
                                            className="unhide-btn"
                                            onClick={() => handleUnhide(recipe._id)}
                                            title="Unhide this recipe"
                                        >
                                            🔄 Unhide
                                        </button>
                                    </div>
                                </div>
                                <p className="suggestion-description">{recipe.description}</p>
                                {renderStars(recipe._id)}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Active Suggestions */}
            {suggestions.length === 0 ? (
                <div className="empty-state">
                    <p>No suggestions yet. Add items to your pantry that are about to expire to see recipes you can make!</p>
                </div>
            ) : (
                <div className="suggestions-list">
                    {suggestions.map(recipe => (
                        <div key={recipe._id} className={`suggestion-card ${favorites[recipe._id] ? 'favorite' : ''}`}>
                            <div className="suggestion-header">
                                <div className="suggestion-title">
                                    <h3>{recipe.name}</h3>
                                    {favorites[recipe._id] && <span className="favorite-badge">⭐ Favorite</span>}
                                </div>
                                <div className="suggestion-badges">
                                    <span className="match-badge">{recipe.matchCount} ingredient match</span>
                                    <button 
                                        className={`favorite-btn ${favorites[recipe._id] ? 'active' : ''}`}
                                        onClick={() => handleFavorite(recipe._id)}
                                        title={favorites[recipe._id] ? 'Remove from favorites' : 'Add to favorites'}
                                    >
                                        {favorites[recipe._id] ? '★' : '☆'}
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
                            <p className="suggestion-description">{recipe.description}</p>
                            <div className="suggestion-meta">
                                <span>⏱️ {recipe.prepTime + recipe.cookTime} min</span>
                                <span>🍽️ {recipe.servings} servings</span>
                            </div>
                            
                            {renderStars(recipe._id)}
                            
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
                                            <li key={i}>✅ {match.expiringItem} → used as {match.recipeIngredient}</li>
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
            )}
        </div>
    );
};

export default SuggestedRecipes;