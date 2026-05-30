import React, { useState } from 'react';
import api from '../api';
import './AddRecipeForm.css';

const AddRecipeForm = ({ onRecipeAdded, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        ingredients: [{ name: '', quantity: '', unit: '' }],
        instructions: '',
        prepTime: 0,
        cookTime: 0,
        servings: 4,
        category: 'dinner',
        tags: []
    });
    const [tagInput, setTagInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Add a new ingredient field
    const addIngredient = () => {
        setFormData({
            ...formData,
            ingredients: [...formData.ingredients, { name: '', quantity: '', unit: '' }]
        });
    };

    // Remove an ingredient field
    const removeIngredient = (index) => {
        const newIngredients = formData.ingredients.filter((_, i) => i !== index);
        setFormData({ ...formData, ingredients: newIngredients });
    };

    // Update ingredient field
    const updateIngredient = (index, field, value) => {
        const newIngredients = [...formData.ingredients];
        newIngredients[index][field] = value;
        setFormData({ ...formData, ingredients: newIngredients });
    };

    // Add a tag
    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({
                ...formData,
                tags: [...formData.tags, tagInput.trim()]
            });
            setTagInput('');
        }
    };

    // Remove a tag
    const removeTag = (tag) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(t => t !== tag)
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate required fields
        if (!formData.name.trim()) {
            setError('Recipe name is required');
            setLoading(false);
            return;
        }
        if (!formData.instructions.trim()) {
            setError('Instructions are required');
            setLoading(false);
            return;
        }
        if (formData.ingredients.length === 0 || !formData.ingredients[0].name) {
            setError('At least one ingredient is required');
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/recipes', formData);
            onRecipeAdded(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add recipe');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-recipe-modal">
            <div className="add-recipe-content">
                <div className="add-recipe-header">
                    <h2>➕ Add New Recipe</h2>
                    <button className="close-btn" onClick={onCancel}>✕</button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="add-recipe-form">
                    {/* Basic Information */}
                    <div className="form-section">
                        <h3>Basic Information</h3>
                        
                        <div className="form-group">
                            <label>Recipe Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Grandma's Chocolate Cake"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description of the recipe..."
                                rows="2"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Prep Time (minutes)</label>
                                <input
                                    type="number"
                                    value={formData.prepTime}
                                    onChange={(e) => setFormData({ ...formData, prepTime: parseInt(e.target.value) || 0 })}
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label>Cook Time (minutes)</label>
                                <input
                                    type="number"
                                    value={formData.cookTime}
                                    onChange={(e) => setFormData({ ...formData, cookTime: parseInt(e.target.value) || 0 })}
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label>Servings</label>
                                <input
                                    type="number"
                                    value={formData.servings}
                                    onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) || 4 })}
                                    min="1"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="breakfast">Breakfast</option>
                                <option value="lunch">Lunch</option>
                                <option value="dinner">Dinner</option>
                                <option value="snack">Snack</option>
                                <option value="dessert">Dessert</option>
                                <option value="side">Side Dish</option>
                            </select>
                        </div>
                    </div>

                    {/* Ingredients Section */}
                    <div className="form-section">
                        <h3>Ingredients *</h3>
                        {formData.ingredients.map((ingredient, index) => (
                            <div key={index} className="ingredient-row">
                                <input
                                    type="text"
                                    placeholder="Ingredient name"
                                    value={ingredient.name}
                                    onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                                    className="ingredient-name"
                                />
                                <input
                                    type="text"
                                    placeholder="Quantity"
                                    value={ingredient.quantity}
                                    onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                                    className="ingredient-quantity"
                                />
                                <input
                                    type="text"
                                    placeholder="Unit"
                                    value={ingredient.unit}
                                    onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                                    className="ingredient-unit"
                                />
                                {formData.ingredients.length > 1 && (
                                    <button type="button" onClick={() => removeIngredient(index)} className="remove-ingredient">
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={addIngredient} className="add-ingredient-btn">
                            + Add Ingredient
                        </button>
                    </div>

                    {/* Instructions Section */}
                    <div className="form-section">
                        <h3>Instructions *</h3>
                        <textarea
                            value={formData.instructions}
                            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                            placeholder="Step-by-step instructions..."
                            rows="6"
                            required
                        />
                    </div>

                    {/* Tags Section */}
                    <div className="form-section">
                        <h3>Tags (optional)</h3>
                        <div className="tags-input">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                placeholder="Add tags like 'quick', 'vegetarian', 'spicy'"
                            />
                            <button type="button" onClick={addTag}>Add Tag</button>
                        </div>
                        <div className="tags-list">
                            {formData.tags.map(tag => (
                                <span key={tag} className="tag">
                                    {tag}
                                    <button type="button" onClick={() => removeTag(tag)}>✕</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Adding Recipe...' : 'Add Recipe'}
                        </button>
                        <button type="button" onClick={onCancel} className="btn-cancel">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddRecipeForm;