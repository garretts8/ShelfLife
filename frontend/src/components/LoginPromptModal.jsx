import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPromptModal.css';

const LoginPromptModal = ({ isOpen, onClose, recipeName }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleLogin = () => {
        onClose();
        navigate('/login');
    };

    const handleSignup = () => {
        onClose();
        navigate('/login');
    };

    return (
        <div className="login-prompt-overlay" onClick={onClose}>
            <div className="login-prompt-modal" onClick={(e) => e.stopPropagation()}>
                <button className="login-prompt-close" onClick={onClose}>✕</button>
                
                <div className="login-prompt-icon">🍽️</div>
                <h2>Ready to Cook?</h2>
                <p>
                    {recipeName ? (
                        <>Want to try <strong>"{recipeName}"</strong>?</>
                    ) : (
                        <>Want to see more recipes?</>
                    )}
                </p>
                <p className="login-prompt-subtext">
                    Create a free account to:
                </p>
                <ul className="login-prompt-features">
                    <li>📦 Track your pantry items</li>
                    <li>⏰ Get expiration date alerts</li>
                    <li>🚨 Manage your emergency kit</li>
                    <li>🍳 Save favorite recipes</li>
                </ul>
                <div className="login-prompt-buttons">
                    <button className="login-prompt-btn-primary" onClick={handleSignup}>
                        Sign Up Free
                    </button>
                    <button className="login-prompt-btn-secondary" onClick={handleLogin}>
                        Log In
                    </button>
                </div>
                <p className="login-prompt-terms">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
};

export default LoginPromptModal;