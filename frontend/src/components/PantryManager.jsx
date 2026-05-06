import React, { useState, useEffect } from 'react';
import pantryService from '../services/pantryService';
import './PantryManager.css';

const PantryManager = () => {
    const [items, setItems] = useState([]);
    const [expiringItems, setExpiringItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        quantity: 1,
        unit: '',
        category: 'canned',
        expirationDate: '',
        notes: ''
    });

    // Load items on component mount
    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            setLoading(true);
            const [allItems, expiring] = await Promise.all([
                pantryService.getAll(),
                pantryService.getExpiring()
            ]);
            setItems(allItems);
            setExpiringItems(expiring);
            setError('');
        } catch (err) {
            setError('Failed to load pantry items');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await pantryService.update(editingItem._id, formData);
            } else {
                await pantryService.create(formData);
            }
            resetForm();
            loadItems();
        } catch (err) {
            setError(editingItem ? 'Failed to update item' : 'Failed to add item');
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await pantryService.delete(id);
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
            expirationDate: item.expirationDate.split('T')[0],
            notes: item.notes || ''
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
            category: 'canned',
            expirationDate: '',
            notes: ''
        });
    };

    const getExpirationStatus = (date) => {
        const today = new Date();
        const expDate = new Date(date);
        const daysUntilExpire = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

        if (daysUntilExpire < 0) return { text: 'Expired', className: 'status-expired' };
        if (daysUntilExpire <= 7) return { text: 'Expiring Soon', className: 'status-expiring' };
        return { text: 'Good', className: 'status-good' };
    };

    if (loading) return <div className="pantry-loading">Loading pantry items...</div>;

    return (
        <div className="pantry-manager">
            <div className="pantry-header">
                <h2>📦 Pantry Inventory</h2>
                <button onClick={() => setShowForm(!showForm)} className="btn-add">
                    {showForm ? 'Cancel' : '+ Add Item'}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Expiring Soon Section */}
            {expiringItems.length > 0 && (
                <div className="expiring-section">
                    <h3>⚠️ Expiring Soon ({expiringItems.length})</h3>
                    <div className="expiring-list">
                        {expiringItems.map(item => (
                            <div key={item._id} className="expiring-card">
                                <div className="expiring-info">
                                    <strong>{item.name}</strong>
                                    <span>Expires: {new Date(item.expirationDate).toLocaleDateString()}</span>
                                </div>
                                <button onClick={() => handleEdit(item)} className="btn-small">Edit</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add/Edit Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="pantry-form">
                    <h3>{editingItem ? 'Edit Item' : 'Add New Item'}</h3>

                    <div className="form-group">
                        <label>Item Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                                <option value="cans">Cans</option>
                                <option value="lbs">Lbs</option>
                                <option value="oz">Oz</option>
                                <option value="packages">Packages</option>
                                <option value="bottles">Bottles</option>
                                <option value="boxes">Boxes</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Category *</label>
                            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
                                <option value="canned">Canned Goods</option>
                                <option value="dry">Dry Goods</option>
                                <option value="dairy">Dairy</option>
                                <option value="produce">Produce</option>
                                <option value="meat">Meat</option>
                                <option value="frozen">Frozen</option>
                                <option value="beverage">Beverages</option>
                                <option value="spices">Spices</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Expiration Date *</label>
                            <input
                                type="date"
                                value={formData.expirationDate}
                                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows="2"
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

            {/* All Items List */}
            <div className="items-list">
                <h3>All Items ({items.length})</h3>
                {items.length === 0 && !showForm && (
                    <p className="empty-message">No items in your pantry. Click "Add Item" to get started!</p>
                )}
                <div className="items-grid">
                    {items.map(item => {
                        const status = getExpirationStatus(item.expirationDate);
                        return (
                            <div key={item._id} className={`item-card ${status.className}`}>
                                <div className="item-header">
                                    <h4>{item.name}</h4>
                                    <span className={`status-badge ${status.className}`}>{status.text}</span>
                                </div>
                                <div className="item-details">
                                    <p>Quantity: {item.quantity} {item.unit}</p>
                                    <p>Category: {item.category}</p>
                                    <p>Expires: {new Date(item.expirationDate).toLocaleDateString()}</p>
                                    {item.notes && <p className="item-notes">📝 {item.notes}</p>}
                                </div>
                                <div className="item-actions">
                                    <button onClick={() => handleEdit(item)} className="btn-edit">Edit</button>
                                    <button onClick={() => handleDelete(item._id)} className="btn-delete">Delete</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PantryManager;