import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleLogin from './GoogleLogin';
import CanIcon from './CanIcon';
import './Header.css';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="shelflife-header">
            <div className="header-container">
                <Link to="/" className="logo">
                    <CanIcon className="logo-icon" />
                    <span className="logo-text">ShelfLife</span>
                </Link>

                <nav className="header-nav">
                    {user ? (
                        <>
                            <Link to="/dashboard" className="nav-link">Dashboard</Link>
                            <Link to="/all-recipes" className="nav-link">Recipes</Link>
                            <Link to="/emergency-kit" className="nav-link">Emergency Kit</Link>
                            <div className="user-menu">
                                <span className="user-avatar">
                                    👤 {user.name?.split(' ')[0] || 'User'}
                                </span>
                                <button onClick={handleLogout} className="logout-btn">
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="auth-buttons">
                            <GoogleLogin />  {/* Use the actual GoogleLogin component */}
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;