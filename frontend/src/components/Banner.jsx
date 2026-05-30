import React from 'react';
import './Banner.css';

const Banner = ({ title, subtitle, backgroundImage, showButton, buttonText, buttonLink }) => {
    return (
        <div className="shelflife-banner" style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}>
            <div className="banner-overlay"></div>
            <div className="banner-content">
                <h1 className="banner-title">{title || '🍽️ ShelfLife'}</h1>
                <p className="banner-subtitle">
                    {subtitle || 'Track your pantry. Stop food waste. Get recipe ideas.'}
                </p>
                {showButton && (
                    <a href={buttonLink || '/login'} className="banner-btn">
                        {buttonText || 'Get Started →'}
                    </a>
                )}
            </div>
        </div>
    );
};

export default Banner;