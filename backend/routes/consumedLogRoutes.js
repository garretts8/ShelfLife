const express = require('express');
const router = express.Router();
const ConsumedLog = require('../models/ConsumedLog');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// ============================================
// GET - Get all consumed items for the user
// GET /api/consumed-logs
// ============================================
router.get('/', async (req, res) => {
    try {
        const logs = await ConsumedLog.find({ user: req.user.id })
            .sort({ consumedAt: -1 });  // Most recent first
        res.json(logs);
    } catch (error) {
        console.error('Get consumed logs error:', error);
        res.status(500).json({ message: error.message });
    }
});

// ============================================
// GET - Get summary statistics
// GET /api/consumed-logs/summary
// ============================================
router.get('/summary', async (req, res) => {
    try {
        const logs = await ConsumedLog.find({ user: req.user.id });
        
        const totalItems = logs.length;
        const expiredItems = logs.filter(l => l.reason === 'expired').length;
        const consumedItems = logs.filter(l => l.reason === 'consumed').length;
        
        // Get last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentItems = logs.filter(l => l.consumedAt >= thirtyDaysAgo);
        
        res.json({
            totalItems,
            expiredItems,
            consumedItems,
            itemsLast30Days: recentItems.length,
            recentItems: recentItems.slice(0, 10)  // Last 10 items
        });
    } catch (error) {
        console.error('Get summary error:', error);
        res.status(500).json({ message: error.message });
    }
});

// ============================================
// POST - Log a consumed item
// POST /api/consumed-logs
// ============================================
router.post('/', async (req, res) => {
    try {
        const { itemName, category, quantity, unit, expirationDate, reason } = req.body;

        if (!itemName || !reason) {
            return res.status(400).json({
                message: 'Required fields: itemName and reason are required.'
            });
        }

        const log = await ConsumedLog.create({
            user: req.user.id,
            itemName,
            category: category || 'other',
            quantity: quantity || 1,
            unit: unit || '',
            expirationDate,
            reason
        });

        res.status(201).json(log);
    } catch (error) {
        console.error('Create consumed log error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
