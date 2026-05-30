import React from 'react';
import { Link } from 'react-router-dom';
import CanIcon from './CanIcon';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="shelflife-footer">
            <div className="footer-container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>ShelfLife</h3>
                        <p>Smart pantry management & emergency preparedness</p>
                    </div>
                    
                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><Link to="/dashboard?tab=pantry">Pantry Items</Link></li>
                            <li><Link to="/emergency-kit">Emergency Kit</Link></li>
                            <li><Link to="/all-recipes">All Recipes</Link></li>
                        </ul>
                    </div>
                    
                    <div className="footer-section">
                        <h4>Legal</h4>
                        <ul>
                            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                            <li><Link to="/terms">Terms of Service</Link></li>
                        </ul>
                    </div>
                    
                    <div className="footer-section">
                        <h4>Connect</h4>
                        <ul>
                            <li><a href="https://github.com/garretts8/ShelfLife" target="_blank" rel="noopener noreferrer">GitHub</a></li>
                            <li><a href="mailto:gar21085@byui.edu">Contact Support</a></li>
                        </ul>
                    </div>
                </div>
                
                <div className="footer-bottom">
                    <div className="footer-brand">
                        <CanIcon className="footer-can-icon" />
                        <span>ShelfLife — reduce food waste • stay prepared • cook smart</span>
                    </div>
                    <p className="copyright">© 2026 ShelfLife | BYU-Idaho CSE 499 Senior Project</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;