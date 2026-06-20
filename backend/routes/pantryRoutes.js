//Full CRUD (Create, Read, Update, Delete) for pantry items

const express = require('express');
const router = express.Router();
const PantryItem = require('../models/PantryItem');
const { protect } = require('../middleware/authMiddleware');
// Import the ConsumedLog model at the top of the file
const ConsumedLog = require('../models/ConsumedLog');

// ============================================
// Helper function to fix timezone offset issue
// ============================================
const parseLocalDate = (dateString) => {
    if (!dateString) return null;
    // Create date and set to noon UTC to avoid day shift
    const date = new Date(dateString);
    date.setUTCHours(12, 0, 0, 0);
    return date;
};

// ============================================
// All routes require authentication
// ============================================
router.use(protect);

// ============================================
// CREATE - Add new pantry item
// POST /api/pantry
// ============================================
router.post('/', async (req, res) => {
    try {
        const { name, quantity, unit, category, expirationDate, notes } = req.body;

        //Validate required fields
        if (!name || !category || !expirationDate) {
            return res.status(400).json({
                message: 'Please required fields: name, category, and expiration date are required.'
            });
        }

        const pantryItem = await PantryItem.create({
            user: req.user.id,
            name,
            quantity: quantity || 1,
            unit: unit || '',
            category,
            expirationDate: parseLocalDate(expirationDate),
            notes: notes || ''
        });

        res.status(201).json(pantryItem);
    } catch (error) {
        console.error('Create pantry item error: ', error);
        res.status(500).json({ message: error.message });
    }
});
// ============================================
// READ - Get all pantry items for logged-in user
// GET /api/pantry
// ============================================
router.get('/', async (req, res) => {
    try {
        const items = await PantryItem.find({ user: req.user.id })
            .sort({ expirationDate: 1 });
        res.json(items);
    } catch (error) {
        console.error('Get pantry items error: ', error);
        res.status(500).json({ message: error.message });
    }
});
// ============================================
// READ - Get expiring soon items (next 7 days)
// GET /api/pantry/expiring
// ============================================
router.get('/expiring-soon', async (req, res) => {
    try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0); // Start of day UTC

        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        nextWeek.setUTCHours(23, 59, 59, 999); // End of day UTC

        const expiringItems = await PantryItem.find({
            user: req.user.id,
            expirationDate: {
                $gte: today,
                $lte: nextWeek
            }
        }).sort({ expirationDate: 1 });

        res.json(expiringItems);
    } catch (error) {
        console.error('Get expiring items error: ', error);
        res.status(500).json({ message: error.message });
    }
});

// ============================================
// READ - Get single pantry item by ID
// GET /api/pantry/:id
// ============================================
router.get('/:id', async (req, res) => {
    try {
        const item = await PantryItem.findById(req.params.id);

        //Check if item exists
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        //Check if the logged-in user is the owner of the item
        if (item.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'User not authorized to access this item.' })
        }

        res.json(item);
    } catch (error) {
        console.error('Get single item error: ', error);

        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Invalid item ID' });
        }

        res.status(500).json({ message: error.message });
    }
});

// UPDATE - Update pantry item
// PUT /api/pantry/:id
// ============================================

router.put('/:id', async (req, res) => {
    try {
        const item = await PantryItem.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Pantry item not found' });
        }

        if (item.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'User not authorized to update this item.' })
        }

        //Update fields
        const {
            name,
            quantity,
            unit,
            category,
            expirationDate,
            notes
        } = req.body;

        item.name = name || item.name;
        item.quantity = quantity !== undefined ? quantity : item.quantity;
        item.unit = unit !== undefined ? unit : item.unit
        item.category = category || item.category;
        item.expirationDate = expirationDate ? parseLocalDate(expirationDate) : item.expirationDate;
        item.notes = notes !== undefined ? notes : item.notes;
        item.updatedAt = Date.now();

        const updatedItem = await item.save();
        res.json(updatedItem);
    } catch (error) {
        console.error('Error updating pantry item: ', error);
        res.status(500).json({ message: error.message });
    }
});

// DELETE - Delete pantry item
// DELETE /api/pantry/:id
// ============================================
router.delete('/:id', async (req, res) => {
    try {
        const item = await PantryItem.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Pantry item not found' });
        }

        if (item.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'User not authorized to delete this item.' })
        }

        // ============================================
        // NEW: Log to consumedlog before deleting
        // ============================================
        try {
            await ConsumedLog.create({
                user: req.user.id,
                itemName: item.name,
                category: item.category,
                quantity: item.quantity,
                unit: item.unit || '',
                expirationDate: item.expirationDate,
                reason: item.expirationDate < new Date() ? 'expired' : 'consumed'
            });
            console.log(`Item "${item.name}" logged to consumedlog`);
        } catch (logError) {
            // Log the error but don't stop the deletion
            console.error('Failed to log consumed item:', logError);
        }

        await item.deleteOne();
        res.json({ message: 'Pantry item removed from pantry', id: req.params.id });

    } catch (error) {
        console.error('Error deleting pantry item: ', error);
        res.status(500).json({ message: 'Failed to delete pantry item' });
    }
});

module.exports = router;