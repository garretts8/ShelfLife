import React, { useState, useEffect } from 'react';
import api from '../api';
import './ConsumedItems.css';

const ConsumedItems = () => {
    const [items, setItems] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [itemsRes, summaryRes] = await Promise.all([
                api.get('/consumed-logs'),
                api.get('/consumed-logs/summary')
            ]);
            setItems(itemsRes.data);
            setSummary(summaryRes.data);
            setError('');
        } catch (err) {
            setError('Failed to load consumed items');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getReasonBadge = (reason) => {
        switch (reason) {
            case 'consumed':
                return <span className="badge-consumed">✅ Consumed</span>;
            case 'expired':
                return <span className="badge-expired">❌ Expired</span>;
            case 'donated':
                return <span className="badge-donated">🤝 Donated</span>;
            default:
                return <span className="badge-other">📦 Other</span>;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) return <div className="consumed-loading">Loading consumed items...</div>;

    if (error) return <div className="consumed-error">{error}</div>;

    return (
        <div className="consumed-items">
            <div className="consumed-header">
                <h2>📋 Consumed Items</h2>
                <p className="consumed-subtitle">
                    Track what you've used or thrown away from your pantry
                </p>
            </div>

            {/* Summary Statistics */}
            {summary && (
                <div className="consumed-summary">
                    <div className="summary-card">
                        <span className="summary-number">{summary.totalItems}</span>
                        <span className="summary-label">Total Items</span>
                    </div>
                    <div className="summary-card">
                        <span className="summary-number">{summary.consumedItems}</span>
                        <span className="summary-label">Consumed</span>
                    </div>
                    <div className="summary-card">
                        <span className="summary-number">{summary.expiredItems}</span>
                        <span className="summary-label">Expired</span>
                    </div>
                    <div className="summary-card">
                        <span className="summary-number">{summary.itemsLast30Days}</span>
                        <span className="summary-label">Last 30 Days</span>
                    </div>
                </div>
            )}

            {/* Items List */}
            {items.length === 0 ? (
                <div className="consumed-empty">
                    <p>No items have been consumed or removed yet.</p>
                    <p className="empty-hint">Delete items from your pantry to track what you've used.</p>
                </div>
            ) : (
                <div className="consumed-list">
                    {items.map(item => (
                        <div key={item._id} className="consumed-item">
                            <div className="consumed-item-header">
                                <h4>{item.itemName}</h4>
                                {getReasonBadge(item.reason)}
                            </div>
                            <div className="consumed-item-details">
                                <p>Quantity: {item.quantity} {item.unit}</p>
                                <p>Category: {item.category}</p>
                                {item.expirationDate && (
                                    <p>Original Expiration: {formatDate(item.expirationDate)}</p>
                                )}
                                <p className="consumed-date">
                                    Removed: {formatDate(item.consumedAt)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ConsumedItems;