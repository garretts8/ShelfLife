import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleLogin from './GoogleLogin';
import './LoginPage.css';

const LoginPage = () => {
    const { user } = useAuth();

    // If already logged in, redirect to dashboard
    if (user) {
        return <Navigate to="/dashboard" />;
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <Link to="/" className="back-link">← Back to Home</Link>
                <div className="login-icon">🍽️</div>
                <h1>Welcome to ShelfLife</h1>
                <p>Sign in to manage your pantry, track expiration dates, and get recipe suggestions.</p>
                <div className="google-login-wrapper">
                    <GoogleLogin />
                </div>
                <p className="login-terms">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;