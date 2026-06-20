// Emergency Kit Routes - Full CRUD operations
const express = require('express');
const router = express.Router();
const EmergencyKitItem = require('../models/EmergencyKitItem');
const { protect } = require('../middleware/authMiddleware');
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

// Debug logging: log each incoming request to these routes (do not print tokens)
router.use((req, res, next) => {
    console.log('EmergencyKit route:', req.method, req.path, 'AuthHeader:', req.headers.authorization ? 'present' : 'missing');
    next();
});

// All routes require authentication
router.use(protect);

// ============================================
// CREATE - Add new emergency kit item
// POST /api/emergency-kit
// ============================================
router.post('/', async (req, res) => {
    try {
        const { name, quantity, unit, category, replacementDate, notes, location, isEssential } = req.body;

        if (!name || !category) {
            return res.status(400).json({
                message: 'Required fields: name and category are required.'
            });
        }

        const kitItem = await EmergencyKitItem.create({
            user: req.user.id,
            name,
            quantity: quantity || 1,
            unit: unit || '',
            category,
            replacementDate: replacementDate ? parseLocalDate(replacementDate) : null,  // FIXED
            notes: notes || '',
            location: location || '',
            isEssential: isEssential || false
        });

        console.log('EmergencyKit created:', { id: kitItem._id?.toString(), user: req.user.id, name: kitItem.name });
        res.status(201).json(kitItem);
    } catch (error) {
        console.error('Create emergency kit item error:', error);
        res.status(500).json({ message: error.message });
    }
});

// ============================================
// READ - Get all emergency kit items for logged-in user
// GET /api/emergency-kit
// ============================================
router.get('/', async (req, res) => {
    try {
        const items = await EmergencyKitItem.find({ user: req.user.id })
            .sort({ category: 1, name: 1 });
        res.json(items);
    } catch (error) {
        console.error('Get emergency kit items error:', error);
        res.status(500).json({ message: error.message });
    }
});

// ============================================
// READ - Get items by category
// GET /api/emergency-kit/category/:category
// ============================================
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const items = await EmergencyKitItem.find({
            user: req.user.id,
            category: category
        }).sort({ name: 1 });
        res.json(items);
    } catch (error) {
        console.error('Get category items error:', error);
        res.status(500).json({ message: error.message });
    }
});

// ============================================
// READ - Get expiring/replacement soon items (next 30 days)
// GET /api/emergency-kit/expiring-soon
// ============================================
router.get('/expiring-soon', async (req, res) => {
    try {
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setDate(today.getDate() + 30);
        today.setUTCHours(0, 0, 0, 0);
        nextMonth.setUTCHours(23, 59, 59, 999);

        const expiringItems = await EmergencyKitItem.find({
            user: req.user.id,
            replacementDate: {
                $gte: today,
                $lte: nextMonth
            }
        }).sort({ replacementDate: 1 });

        res.json(expiringItems);
    } catch (error) {
        console.error('Get expiring kit items error:', error);
        res.status(500).json({ message: error.message });
    }
});

// ============================================
// PDF GENERATION - Download emergency kit as PDF
// GET /api/emergency-kit/download-pdf
// ============================================
router.get('/download-pdf', async (req, res) => {
    try {
        // Get all emergency kit items for the user
        const items = await EmergencyKitItem.find({ user: req.user.id })
            .sort({ category: 1, name: 1 });
        
        if (items.length === 0) {
            return res.status(404).json({ 
                message: 'No items in your emergency kit. Add some items first!' 
            });
        }
        
        // Generate PDF
        const { generateEmergencyKitPDF } = require('../services/pdfService');
        const pdfBuffer = await generateEmergencyKitPDF(items, req.user.name);
        
        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="emergency-kit-checklist.pdf"');
        res.setHeader('Content-Length', pdfBuffer.length);
        
        res.send(pdfBuffer);
        
    } catch (error) {
        console.error('PDF Generation error:', error);
        res.status(500).json({ message: 'Failed to generate PDF', error: error.message });
    }
});

// ============================================
// READ - Get single item by ID
// GET /api/emergency-kit/:id
// ============================================
router.get('/:id', async (req, res) => {
    try {
        const item = await EmergencyKitItem.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if (item.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(item);
    } catch (error) {
        console.error('Get single item error:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Invalid item ID' });
        }
        res.status(500).json({ message: error.message });
    }
});

// ============================================
// UPDATE - Update emergency kit item
// PUT /api/emergency-kit/:id
// ============================================
router.put('/:id', async (req, res) => {
    try {
        const item = await EmergencyKitItem.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if (item.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { name, quantity, unit, category, replacementDate, notes, location, isEssential } = req.body;

        item.name = name || item.name;
        item.quantity = quantity !== undefined ? quantity : item.quantity;
        item.unit = unit !== undefined ? unit : item.unit;
        item.category = category || item.category;
        item.replacementDate = replacementDate ? parseLocalDate(replacementDate) : item.replacementDate;  // FIXED
        item.notes = notes !== undefined ? notes : item.notes;
        item.location = location !== undefined ? location : item.location;
        item.isEssential = isEssential !== undefined ? isEssential : item.isEssential;
        item.updatedAt = Date.now();

        const updatedItem = await item.save();
        res.json(updatedItem);
    } catch (error) {
        console.error('Update kit item error:', error);
        res.status(500).json({ message: error.message });
    }
});

// ============================================
// DELETE - Delete emergency kit item
// DELETE /api/emergency-kit/:id
// ============================================
router.delete('/:id', async (req, res) => {
    try {
        const item = await EmergencyKitItem.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if (item.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

// Log to consumedlog before deleting
        try {
            await ConsumedLog.create({
                user: req.user.id,
                itemName: item.name,
                category: item.category,
                quantity: item.quantity,
                unit: item.unit || '',
                expirationDate: item.replacementDate,
                reason: 'other'
            });
            console.log(`Item "${item.name}" logged to consumedlog`);
        } catch (logError) {
            console.error('Failed to log consumed item:', logError);
        }

        await item.deleteOne();
        res.json({ message: 'Item removed from emergency kit', id: req.params.id });
    } catch (error) {
        console.error('Delete kit item error:', error);
        res.status(500).json({ message: 'Failed to delete item' });
    }
});

module.exports = router;