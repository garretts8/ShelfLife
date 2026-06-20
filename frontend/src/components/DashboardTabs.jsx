import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PantryManager from './PantryManager';
import EmergencyKitManager from './EmergencyKitManager';
import AllRecipes from './AllRecipes';
import SuggestedRecipes from './SuggestedRecipes';
import NotificationSettings from './NotificationSettings';
import ConsumedItems from './ConsumedItems';  // ← ADD THIS IMPORT
import './DashboardTabs.css';

const DashboardTabs = () => {
    const { user } = useAuth();  // Remove logout from here (handled by Header)
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState('pantry');

    // Read tab from URL on initial load
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam && ['pantry', 'emergency', 'allrecipes', 'suggested', 'notifications', 'consumed'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    const tabs = [
        { id: 'pantry', label: 'Pantry Items', icon: '📦' },
        { id: 'emergency', label: 'Emergency Kit', icon: '🚨' },
        { id: 'allrecipes', label: 'All Recipes', icon: '🍳' },
        { id: 'suggested', label: 'Suggested Recipes', icon: '💡' },
        { id: 'consumed', label: 'Consumed Items', icon: '📋' },  // ← ADD THIS TAB
        { id: 'notifications', label: 'Notifications', icon: '⚙️' }
    ];

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setSearchParams({ tab: tabId });
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'pantry':
                return <PantryManager />;
            case 'emergency':
                return <EmergencyKitManager />;
            case 'allrecipes':
                return <AllRecipes />;
            case 'suggested':
                return <SuggestedRecipes />;
            case 'consumed':
                return <ConsumedItems />;  // ← ADD THIS CASE
            case 'notifications':
                return <NotificationSettings />;
            default:
                return <PantryManager />;
        }
    };

    return (
        <div className="dashboard-container">
            {/* REMOVED the header section - it's now in Header.jsx */}
            
            {/* Tabs */}
            <div className="dashboard-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => handleTabChange(tab.id)}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        <span className="tab-label">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="dashboard-content">
                {renderContent()}
            </div>
        </div>
    );
};

export default DashboardTabs;