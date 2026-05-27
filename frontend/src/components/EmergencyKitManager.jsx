import React, { useState, useEffect } from 'react';
import emergencyKitService from '../services/emergencyKitService';
import api from '../api';  
import './EmergencyKitManager.css';

const EmergencyKitManager = () => {
    const [items, setItems] = useState([]);
    const [expiringItems, setExpiringItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [formData, setFormData] = useState({
        name: '',
        quantity: 1,
        unit: '',
        category: 'water',
        replacementDate: '',
        notes: '',
        location: '',
        isEssential: false
    });

    // Category options with icons
    const categories = [
        { value: 'water', label: ' Water', icon: '💧' },
        { value: 'food', label: ' Food', icon: '🍫' },
        { value: 'first aid', label: ' First Aid', icon: '🩹' },
        { value: 'tools', label: ' Tools', icon: '🔧' },
        { value: 'light', label: ' Light', icon: '🔦' },
        { value: 'communication', label: ' Communication', icon: '📻' },
        { value: 'hygiene', label: ' Hygiene', icon: '🧼' },
        { value: 'documents', label: ' Documents', icon: '📋' },
        { value: 'clothing', label: ' Clothing', icon: '👕' },
        { value: 'other', label: ' Other', icon: '📦' }
    ];

    // Load items on component mount
    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            setLoading(true);
            const [allItems, expiring] = await Promise.all([
                emergencyKitService.getAll(),
                emergencyKitService.getExpiringSoon()
            ]);
            setItems(allItems);
            setExpiringItems(expiring);
            setError('');
        } catch (err) {
            setError('Failed to load emergency kit items');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // PDF DOWNLOAD FUNCTION - ADD THIS
    // ============================================
    const downloadPDF = async () => {
        try {
            setLoading(true);
            const response = await api.get('/emergency-kit/download-pdf', {
                responseType: 'blob'  // Important for file download
            });
            
            // Create a download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'emergency-kit-checklist.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('PDF download error:', error);
            if (error.response?.status === 404) {
                alert('No items in your emergency kit. Add some items first!');
            } else {
                alert('Failed to generate PDF. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await emergencyKitService.update(editingItem._id, formData);
            } else {
                await emergencyKitService.create(formData);
            }
            resetForm();
            loadItems();
        } catch (err) {
            setError(editingItem ? 'Failed to update item' : 'Failed to add item');
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item from your emergency kit?')) {
            try {
                await emergencyKitService.delete(id);
                loadItems();
            } catch (err) {
                setError('Failed to delete item');
                console.error(err);
            }
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            quantity: item.quantity,
            unit: item.unit || '',
            category: item.category,
            replacementDate: item.replacementDate ? item.replacementDate.split('T')[0] : '',
            notes: item.notes || '',
            location: item.location || '',
            isEssential: item.isEssential
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setEditingItem(null);
        setShowForm(false);
        setFormData({
            name: '',
            quantity: 1,
            unit: '',
            category: 'water',
            replacementDate: '',
            notes: '',
            location: '',
            isEssential: false
        });
    };

    const getCategoryIcon = (category) => {
        const cat = categories.find(c => c.value === category);
        return cat ? cat.icon : '📦';
    };

    const getReplacementStatus = (date) => {
        if (!date) return null;
        const today = new Date();
        const replaceDate = new Date(date);
        const daysUntilReplace = Math.ceil((replaceDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilReplace < 0) return { text: 'Needs Replacement', className: 'status-expired' };
        if (daysUntilReplace <= 30) return { text: 'Replace Soon', className: 'status-expiring' };
        return { text: 'Good', className: 'status-good' };
    };

    // Filter items by category
    const filteredItems = selectedCategory === 'all' 
        ? items 
        : items.filter(item => item.category === selectedCategory);

    if (loading) return <div className="kit-loading">Loading emergency kit...</div>;

    return (
        <div className="emergency-kit-manager">
            <div className="kit-header">
                <h2>🚨 Emergency Kit</h2>
                <div className="kit-header-buttons">
                    <button onClick={downloadPDF} className="btn-pdf">
                        📄 Print Checklist
                    </button>
                    <button onClick={() => setShowForm(!showForm)} className="btn-add">
                        {showForm ? 'Cancel' : '+ Add Item'}
                    </button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Expiring Soon Section */}
            {expiringItems.length > 0 && (
                <div className="kit-expiring-section">
                    <h3>⚠️ Needs Attention ({expiringItems.length})</h3>
                    <div className="kit-expiring-list">
                        {expiringItems.map(item => {
                            const status = getReplacementStatus(item.replacementDate);
                            return (
                                <div key={item._id} className="kit-expiring-card">
                                    <div className="kit-expiring-info">
                                        <span className="category-icon">{getCategoryIcon(item.category)}</span>
                                        <strong>{item.name}</strong>
                                        <span>Qty: {item.quantity} {item.unit}</span>
                                        {item.replacementDate && (
                                            <span className="expiry-date">
                                                Replace by: {new Date(item.replacementDate).toLocaleDateString()}
                                            </span>
                                        )}
                                        <span className={`status-badge ${status?.className}`}>{status?.text}</span>
                                    </div>
                                    <button onClick={() => handleEdit(item)} className="btn-small">Edit</button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Category Filter */}
            <div className="category-filters">
                <button 
                    className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('all')}
                >
                    All
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.value}
                        className={`filter-btn ${selectedCategory === cat.value ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat.value)}
                    >
                        {cat.icon} {cat.label}
                    </button>
                ))}
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="kit-form">
                    <h3>{editingItem ? 'Edit Emergency Item' : 'Add Emergency Item'}</h3>

                    <div className="form-group">
                        <label>Item Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Bottled Water, First Aid Kit, Flashlight"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Quantity</label>
                            <input
                                type="number"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                min="0"
                            />
                        </div>
                        <div className="form-group">
                            <label>Unit</label>
                            <select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })}>
                                <option value="">None</option>
                                <option value="gallons">Gallons</option>
                                <option value="liters">Liters</option>
                                <option value="bars">Bars</option>
                                <option value="packs">Packs</option>
                                <option value="batteries">Batteries</option>
                                <option value="rolls">Rolls</option>
                                <option value="pairs">Pairs</option>
                                <option value="boxes">Boxes</option>
                                <option value="days">Days Supply</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Category *</label>
                            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Replacement Date (optional)</label>
                            <input
                                type="date"
                                value={formData.replacementDate}
                                onChange={(e) => setFormData({ ...formData, replacementDate: e.target.value })}
                            />
                            <small>When does this item expire or need replacing?</small>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Storage Location</label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="e.g., Go-bag, Basement, Car"
                            />
                        </div>
                        <div className="form-group check-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.isEssential}
                                    onChange={(e) => setFormData({ ...formData, isEssential: e.target.checked })}
                                />
                                ⭐ Mark as Essential
                            </label>
                            <small>Essential items appear highlighted in your kit</small>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows="2"
                            placeholder="e.g., Keep in cool dry place, Check batteries yearly"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn-submit">
                            {editingItem ? 'Update' : 'Add'} Item
                        </button>
                        <button type="button" onClick={resetForm} className="btn-cancel">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Items List by Category */}
            <div className="kit-items-list">
                <h3>Your Emergency Kit ({filteredItems.length} items)</h3>
                {filteredItems.length === 0 && !showForm && (
                    <p className="empty-message">
                        No items in your emergency kit. Click "Add Item" to start preparing!
                    </p>
                )}
                
                {/* Group items by category */}
                {Object.entries(
                    filteredItems.reduce((groups, item) => {
                        const cat = item.category;
                        if (!groups[cat]) groups[cat] = [];
                        groups[cat].push(item);
                        return groups;
                    }, {})
                ).map(([category, categoryItems]) => (
                    <div key={category} className="category-group">
                        <h4 className="category-title">
                            {getCategoryIcon(category)} {categories.find(c => c.value === category)?.label || category}
                        </h4>
                        <div className="kit-items-grid">
                            {categoryItems.map(item => {
                                const status = getReplacementStatus(item.replacementDate);
                                return (
                                    <div key={item._id} className={`kit-item-card ${item.isEssential ? 'essential' : ''} ${status?.className || ''}`}>
                                        <div className="kit-item-header">
                                            <h4>{item.name}</h4>
                                            {item.isEssential && <span className="essential-badge">⭐ Essential</span>}
                                        </div>
                                        <div className="kit-item-details">
                                            <p>Quantity: {item.quantity} {item.unit}</p>
                                            {item.location && <p>📍 Location: {item.location}</p>}
                                            {item.replacementDate && (
                                                <p>🔄 Replace by: {new Date(item.replacementDate).toLocaleDateString()}</p>
                                            )}
                                            {status && <span className={`status-badge ${status.className}`}>{status.text}</span>}
                                            {item.notes && <p className="item-notes">📝 {item.notes}</p>}
                                        </div>
                                        <div className="kit-item-actions">
                                            <button onClick={() => handleEdit(item)} className="btn-edit">Edit</button>
                                            <button onClick={() => handleDelete(item._id)} className="btn-delete">Delete</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EmergencyKitManager;