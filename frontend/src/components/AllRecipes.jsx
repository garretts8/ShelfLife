import React, { useState, useEffect } from 'react';
import api from '../api';
import AddRecipeForm from './AddRecipeForm';
import './AllRecipes.css';

const AllRecipes = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

    useEffect(() => {
        loadAllRecipes();
    }, []);

    const loadAllRecipes = async () => {
        try {
            setLoading(true);
            const response = await api.get('/recipes');
            setRecipes(response.data);
        } catch (error) {
            console.error('Failed to load recipes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRecipeAdded = (newRecipe) => {
        setRecipes([newRecipe, ...recipes]);
        setShowAddForm(false);
    };

    const handleRating = async (recipeId, rating) => {
        try {
            await api.post(`/recipe-preferences/${recipeId}/rate`, { rating });
            loadAllRecipes();
        } catch (error) {
            console.error('Failed to rate recipe:', error);
        }
    };

    const handleFavorite = async (recipeId) => {
        try {
            await api.post(`/recipe-preferences/${recipeId}/favorite`);
            loadAllRecipes();
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        }
    };

    const filteredRecipes = recipes.filter(recipe => {
        const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = [
        { value: 'all', label: 'All' },
        { value: 'breakfast', label: 'Breakfast' },
        { value: 'lunch', label: 'Lunch' },
        { value: 'dinner', label: 'Dinner' },
        { value: 'snack', label: 'Snack' },
        { value: 'dessert', label: 'Dessert' },
        { value: 'side', label: 'Side Dish' }
    ];

    if (loading) return <div className="loading-recipes">Loading recipes...</div>;

    return (
        <div className="all-recipes">
            <div className="recipes-header">
                <div className="recipes-title">
                    <h2>🍳 All Recipes</h2>
                    <button className="add-recipe-btn" onClick={() => setShowAddForm(true)}>
                        + Add Recipe
                    </button>
                </div>
                <div className="recipes-controls">
                    <input
                        type="text"
                        placeholder="Search recipes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <select 
                        value={selectedCategory} 
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="category-select"
                    >
                        {categories.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {showAddForm && (
                <AddRecipeForm 
                    onRecipeAdded={handleRecipeAdded}
                    onCancel={() => setShowAddForm(false)}
                />
            )}

            <div className="recipes-grid">
                {filteredRecipes.map(recipe => (
                    <div key={recipe._id} className={`recipe-card ${recipe.isSystemRecipe === false ? 'user-recipe' : ''}`}>
                        <div className="recipe-card-header">
                            <h3>
                                {recipe.name}
                                {recipe.isSystemRecipe === false && <span className="user-recipe-badge">👤 My Recipe</span>}
                            </h3>
                            <button 
                                className="favorite-icon"
                                onClick={() => handleFavorite(recipe._id)}
                            >
                                ☆
                            </button>
                        </div>
                        <p className="recipe-description">{recipe.description}</p>
                        <div className="recipe-meta">
                            <span>⏱️ {recipe.prepTime + recipe.cookTime} min</span>
                            <span>🍽️ {recipe.servings} servings</span>
                        </div>
                        <div className="rating-stars">
                            {[1, 2, 3, 4, 5].map(star => (
                                <span 
                                    key={star} 
                                    className="star"
                                    onClick={() => handleRating(recipe._id, star)}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                        <button 
                            className="view-recipe-btn"
                            onClick={() => setSelectedRecipe(selectedRecipe === recipe._id ? null : recipe._id)}
                        >
                            {selectedRecipe === recipe._id ? 'Hide Details' : 'View Recipe'}
                        </button>
                        {selectedRecipe === recipe._id && (
                            <div className="recipe-full-details">
                                <h4>Ingredients:</h4>
                                <ul>
                                    {recipe.ingredients.map((ing, i) => (
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

export default AllRecipes;