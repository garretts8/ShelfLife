import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import GoogleLogin from './components/GoogleLogin';
import './App.css';

// Protected Route component - redirects to login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

// Login Page Component
const LoginPage = () => {
  const { user } = useAuth();

  if (user) return <Navigate to="/dashboard" />;

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🍽️ ShelfLife</h1>
        <p>Track your food inventory & emergency supplies</p>
        <div className="google-login-wrapper">
          <GoogleLogin />
        </div>
      </div>
    </div>
  );
};

// Dashboard Component (protected)
const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>ShelfLife</h1>
        <div className="user-info">
          <span>Welcome, {user?.name}!</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>
      <main className="dashboard-main">
        <div className="dashboard-card">
          <h2>📦 Pantry Summary</h2>
          <p>Your food inventory tracking will appear here</p>
        </div>
        <div className="dashboard-card">
          <h2>⚠️ Expiring Soon</h2>
          <p>Items expiring in the next 7 days will show here</p>
        </div>
        <div className="dashboard-card">
          <h2>🚨 Emergency Kit</h2>
          <p>Your emergency supplies status will appear here</p>
        </div>
      </main>
    </div>
  );
};

function AppContent() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    console.error('Google Client ID is missing! Check your .env file');
    return <div className="error">Error: Google Client ID not configured</div>;
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;