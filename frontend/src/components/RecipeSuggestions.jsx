import React, { useState, useEffect } from 'react';
import api from '../api';
import './RecipeSuggestions.css';

const RecipeSuggestions = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecipe, setSelectedRecipe] = useState(null);

    // Move loadSuggestions BEFORE useEffect
    const loadSuggestions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/recipes/suggestions');
            setSuggestions(response.data);
        } catch (error) {
            console.error('Failed to load recipe suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    // Now useEffect can call loadSuggestions without error
    useEffect(() => {
        loadSuggestions();
    }, []);

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
                    <div key={recipe._id} className="recipe-item">
                        <div className="recipe-header">
                            <h3>{recipe.name}</h3>
                            <span className="match-badge">
                                {recipe.matchCount} ingredient{recipe.matchCount !== 1 ? 's' : ''} match
                            </span>
                        </div>
                        <p className="recipe-description">{recipe.description}</p>
                        <div className="recipe-meta">
                            <span>⏱️ {recipe.prepTime + recipe.cookTime} min</span>
                            <span>🍽️ {recipe.servings} servings</span>
                        </div>
                        <button 
                            className="view-recipe-btn"
                            onClick={() => setSelectedRecipe(selectedRecipe?._id === recipe._id ? null : recipe)}
                        >
                            {selectedRecipe?._id === recipe._id ? 'Hide' : 'View'} Recipe
                        </button>
                        
                        {selectedRecipe?._id === recipe._id && (
                            <div className="recipe-details">
                                <h4>Matched Ingredients:</h4>
                                <ul className="matched-ingredients">
                                    {recipe.matchedIngredients && recipe.matchedIngredients.map((matchedItem, idx) => (
                                        <li key={idx}>
                                            ✅ {matchedItem.expiringItem} → used as {matchedItem.recipeIngredient}
                                        </li>
                                    ))}
                                </ul>
                                
                                <h4>All Ingredients:</h4>
                                <ul className="ingredients-list">
                                    {recipe.ingredients && recipe.ingredients.map((ingredient, idx) => (
                                        <li key={idx}>
                                            {ingredient.quantity} {ingredient.unit} {ingredient.name}
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