import React from 'react';

const CanIcon = ({ className, style }) => {
    return (
        <svg 
            className={className} 
            style={style}
            width="28" 
            height="28" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="canGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#2b5e3b' }} />
                    <stop offset="100%" style={{ stopColor: '#f4a261' }} />
                </linearGradient>
            </defs>
            {/* Can body */}
            <rect x="7" y="4" width="10" height="16" rx="2" fill="url(#canGradient)" />
            {/* Can top */}
            <ellipse cx="12" cy="4" rx="5" ry="2" fill="#1f462b" />
            {/* Can bottom */}
            <ellipse cx="12" cy="20" rx="5" ry="2" fill="#1f462b" />
            {/* Pull tab ring */}
            <ellipse cx="12" cy="4" rx="3" ry="1" fill="none" stroke="#f4a261" strokeWidth="0.8" />
            {/* Pull tab center dot */}
            <circle cx="12" cy="4" r="0.8" fill="#f4a261" />
        </svg>
    );
};

export default CanIcon;