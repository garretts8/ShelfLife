// PDF Generation Service for Emergency Kit Checklists
const PDFDocument = require('pdfkit');

// Helper: Get category text (no emojis for PDF)
const getCategoryText = (category) => {
    const categories = {
        water: 'Water',
        food: 'Food',
        'first aid': 'First Aid',
        tools: 'Tools',
        light: 'Light',
        communication: 'Communication',
        hygiene: 'Hygiene',
        documents: 'Documents',
        clothing: 'Clothing',
        other: 'Other'
    };
    return categories[category] || 'Other';
};

// Generate emergency kit PDF
const generateEmergencyKitPDF = async (items, userName) => {
    return new Promise((resolve, reject) => {
        try {
            // Create a new PDF document
            const doc = new PDFDocument({
                margin: 50,
                size: 'Letter',
                info: {
                    Title: 'Emergency Kit Checklist',
                    Author: 'ShelfLife',
                    Subject: 'Emergency Preparedness Inventory'
                }
            });

            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // ============================================
            // HEADER SECTION
            // ============================================
            
            doc.fontSize(24)
               .font('Helvetica-Bold')
               .fillColor('#003d5b')
               .text('Emergency Kit Checklist', { align: 'center' });
            
            doc.moveDown(0.5);
            
            doc.fontSize(11)
               .font('Helvetica')
               .fillColor('#666666')
               .text(`Prepared for: ${userName || 'ShelfLife User'}`, { align: 'center' });
            
            doc.fontSize(11)
               .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
            
            doc.moveDown(1);
            
            doc.strokeColor('#cccccc')
               .lineWidth(1)
               .moveTo(50, doc.y)
               .lineTo(550, doc.y)
               .stroke();
            
            doc.moveDown(0.5);
            
            const totalItems = items.length;
            const essentialItems = items.filter(i => i.isEssential).length;
            const categories = [...new Set(items.map(i => i.category))];
            
            doc.fontSize(10)
               .font('Helvetica')
               .fillColor('#333333')
               .text(`Summary: ${totalItems} total items | ${essentialItems} essential items | ${categories.length} categories`, { align: 'center' });
            
            doc.moveDown(1);
            
            // ============================================
            // GROUP ITEMS BY CATEGORY
            // ============================================
            
            const groupedItems = {};
            for (const item of items) {
                if (!groupedItems[item.category]) {
                    groupedItems[item.category] = [];
                }
                groupedItems[item.category].push(item);
            }
            
            const categoryOrder = ['water', 'food', 'first aid', 'tools', 'light', 'communication', 'hygiene', 'documents', 'clothing', 'other'];
            
            for (const category of categoryOrder) {
                const categoryItems = groupedItems[category];
                if (!categoryItems || categoryItems.length === 0) continue;
                
                if (doc.y > 700) {
                    doc.addPage();
                }
                
                // ============================================
                // CATEGORY HEADER - FORCED LEFT ALIGNMENT
                // ============================================
                const categoryDisplay = getCategoryText(category);
                
                // Save current position
                const currentX = doc.x;
                const currentY = doc.y;
                
                // Reset to left edge for category header
                doc.x = 50;
                
                // Adjust font size for longer names
                let fontSize = 16;
                if (categoryDisplay.length > 10) {
                    fontSize = 12;
                } else if (categoryDisplay.length > 7) {
                    fontSize = 14;
                }
                
                doc.fontSize(fontSize)
                   .font('Helvetica-Bold')
                   .fillColor('#009b72')
                   .text(categoryDisplay, { align: 'left', continued: false });
                
                doc.moveDown(0.3);
                
                // Draw underline
                doc.strokeColor('#009b72')
                   .lineWidth(0.5)
                   .moveTo(50, doc.y)
                   .lineTo(550, doc.y)
                   .stroke();
                
                doc.moveDown(0.5);
                
                // Table headers
                const startY = doc.y;
                const col1 = 50;
                const col2 = 180;
                const col3 = 280;
                const col4 = 400;
                const col5 = 500;
                
                doc.fontSize(9)
                   .font('Helvetica-Bold')
                   .fillColor('#333333')
                   .text('Item', col1, startY)
                   .text('Quantity', col2, startY)
                   .text('Location', col3, startY)
                   .text('Replace By', col4, startY)
                   .text('Essential', col5, startY);
                
                doc.moveDown(0.5);
                
                doc.strokeColor('#cccccc')
                   .lineWidth(0.5)
                   .moveTo(50, doc.y)
                   .lineTo(550, doc.y)
                   .stroke();
                
                doc.moveDown(0.3);
                
                // Table rows
                for (const item of categoryItems) {
                    if (doc.y > 750) {
                        doc.addPage();
                        
                        // Re-draw header on new page
                        doc.fontSize(10)
                           .font('Helvetica-Bold')
                           .fillColor('#009b72')
                           .text(`${categoryDisplay} (continued)`, 50, doc.y, { align: 'left' });
                        doc.moveDown(0.3);
                        doc.strokeColor('#009b72').lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                        doc.moveDown(0.5);
                        
                        const newStartY = doc.y;
                        doc.fontSize(9).font('Helvetica-Bold').fillColor('#333333');
                        doc.text('Item', col1, newStartY);
                        doc.text('Quantity', col2, newStartY);
                        doc.text('Location', col3, newStartY);
                        doc.text('Replace By', col4, newStartY);
                        doc.text('Essential', col5, newStartY);
                        doc.moveDown(0.5);
                        doc.strokeColor('#cccccc').lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                        doc.moveDown(0.3);
                    }
                    
                    const rowY = doc.y;
                    const itemName = item.name.length > 25 ? item.name.substring(0, 22) + '...' : item.name;
                    const quantity = `${item.quantity} ${item.unit}`.trim();
                    const location = item.location || '—';
                    const replaceDate = item.replacementDate ? new Date(item.replacementDate).toLocaleDateString() : '—';
                    const essential = item.isEssential ? 'Yes' : '—';
                    
                    if (categoryItems.indexOf(item) % 2 === 0) {
                        doc.rect(45, rowY - 5, 510, 20)
                           .fillColor('#f9f9f9')
                           .fill();
                    }
                    
                    doc.fillColor('#333333')
                       .fontSize(9)
                       .font('Helvetica')
                       .text(itemName, col1, rowY)
                       .text(quantity, col2, rowY)
                       .text(location, col3, rowY)
                       .text(replaceDate, col4, rowY)
                       .text(essential, col5, rowY);
                    
                    doc.moveDown(0.8);
                }
                
                doc.moveDown(0.5);
            }
            
            // ============================================
            // FOOTER SECTION
            // ============================================
            
            doc.addPage();
            
            doc.fontSize(14)
               .font('Helvetica-Bold')
               .fillColor('#003d5b')
               .text('Emergency Preparedness Tips', { align: 'center' });
            
            doc.moveDown(0.5);
            
            const tips = [
                'Check expiration dates every 6 months',
                'Replace water every 6 months',
                'Replace food bars before expiration',
                'Test batteries and replace as needed',
                'Update first aid kit with fresh supplies',
                'Keep important documents in waterproof container',
                'Store kit in a cool, dry place',
                'Make sure all family members know kit location'
            ];
            
            doc.fontSize(10)
               .font('Helvetica')
               .fillColor('#333333');
            
            for (const tip of tips) {
                doc.text(`• ${tip}`, { indent: 50 });
                doc.moveDown(0.3);
            }
            
            doc.moveDown(1);
            
            doc.fontSize(9)
               .fillColor('#999999')
               .text('Generated by ShelfLife - Food Pantry & Emergency Preparedness Tracker', { align: 'center' });
            
            doc.fontSize(9)
               .text(`© ${new Date().getFullYear()} ShelfLife. All rights reserved.`, { align: 'center' });
            
            doc.end();
            
        } catch (error) {
            console.error('PDF Generation Error:', error);
            reject(error);
        }
    });
};

module.exports = { generateEmergencyKitPDF };