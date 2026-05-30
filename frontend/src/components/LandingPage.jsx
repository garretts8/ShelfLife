import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';

const LandingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // If already logged in, redirect to dashboard
    if (user) {
        navigate('/dashboard');
        return null;
    }

    const sampleRecipes = [
        { id: 1, name: 'Mediterranean Chickpea Bowl', desc: 'Protein-packed, perfect for pantry staples', emoji: '🥙', time: '15 min', rating: '4.8' },
        { id: 2, name: 'Creamy Tomato Lentil Soup', desc: 'Uses canned tomatoes, lentils, onions', emoji: '🍅', time: '25 min', rating: '4.7' },
        { id: 3, name: '3-Bean Chili', desc: 'Great for emergency kit beans', emoji: '🌶️', time: '30 min', rating: '4.9' },
        { id: 4, name: 'No-Waste Veggie Stir-fry', desc: 'Use any expiring vegetables', emoji: '🥬', time: '15 min', rating: '4.6' },
        { id: 5, name: 'Oatmeal Power Bars', desc: 'Long shelf-life snack', emoji: '🍪', time: '10 min', rating: '4.5' },
        { id: 6, name: 'Pantry Pasta Puttanesca', desc: 'Capers, olives, tomatoes', emoji: '🍝', time: '20 min', rating: '4.8' }
    ];

    const handleViewMore = () => {
        alert('📚 30+ recipes available after login!');
    };

    const handleGetStarted = () => {
        navigate('/login');
    };

    return (
        <div className="container">
            <div className="hero">
                <h1>🍽️ Never waste food. Always be ready.</h1>
                <p>Track pantry expiration dates, get smart recipe ideas, and manage your emergency kit — all in one place.</p>
            </div>

            <div className="section-title">
                <span>🍲 Try these popular recipes</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 'normal' }}>inspired by real ingredients</span>
            </div>

            <div className="recipes-grid">
                {sampleRecipes.map(recipe => (
                    <div key={recipe.id} className="recipe-card">
                        <div className="recipe-img">{recipe.emoji}</div>
                        <div className="recipe-info">
                            <div className="recipe-title">{recipe.name}</div>
                            <div className="recipe-desc">{recipe.desc}</div>
                            <div className="recipe-meta">
                                <span>⭐ {recipe.rating}</span>
                                <span>⏱️ {recipe.time}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="btn-view-more">
                <button className="btn-secondary" onClick={handleViewMore}>
                    📖 View more recipes →
                </button>
            </div>

            <div className="login-prompt-card">
                <span style={{ fontSize: '2rem' }}>🔐</span>
                <h3>Unlock your food & emergency hub</h3>
                <p>Log in to start adding pantry items, track expiration alerts, manage your emergency kit, and get personalized recipe suggestions.</p>
                <button className="btn-primary" onClick={handleGetStarted} style={{ marginTop: '1rem', padding: '0.7rem 2rem' }}>
                    Log in to ShelfLife →
                </button>
            </div>
        </div>
    );
};

export default LandingPage;