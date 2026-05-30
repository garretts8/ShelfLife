import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import DashboardTabs from './components/DashboardTabs';
import AllRecipes from './components/AllRecipes';
import EmergencyKitManager from './components/EmergencyKitManager';
import './App.css';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="loading">Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    return children;
};

function AppContent() {
    return (
        <div className="app-wrapper">
            <Header />
            <main className="app-main">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <DashboardTabs />
                        </ProtectedRoute>
                    } />
                    <Route path="/all-recipes" element={
                        <ProtectedRoute>
                            <div className="all-recipes-page">
                                <div className="page-header">
                                    <h1>🍳 All Recipes</h1>
                                    <p>Browse all your saved recipes</p>
                                </div>
                                <AllRecipes />
                            </div>
                        </ProtectedRoute>
                    } />
                    <Route path="/emergency-kit" element={
                        <ProtectedRoute>
                            <div className="emergency-kit-page">
                                <div className="page-header">
                                    <h1>🚨 Emergency Kit</h1>
                                    <p>Track and manage your emergency preparedness supplies</p>
                                </div>
                                <EmergencyKitManager />
                            </div>
                        </ProtectedRoute>
                    } />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}

function App() {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!googleClientId) {
        return <div className="error">Error: Google Client ID not configured</div>;
    }
    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <AuthProvider>
                <Router>
                    <AppContent />
                </Router>
            </AuthProvider>
        </GoogleOAuthProvider>
    );
}

export default App;