// routes/pdfRoutes.js
const express = require('express');
const router = express.Router();
const pdfService = require('../services/pdfService');
const Kit = require('../models/Kit');
const KitItem = require('../models/KitItem');

// Generate PDF for a specific kit
router.get('/kit/:kitId', async (req, res) => {
  try {
    const { kitId } = req.params;
    const { includeSignature = false, includeNotes = true } = req.query;
    
    // Fetch kit details
    const kit = await Kit.findById(kitId);
    if (!kit) {
      return res.status(404).json({ error: 'Kit not found' });
    }
    
    // Fetch kit items
    const items = await KitItem.find({ kitId: kitId });
    
    // Generate PDF
    const pdfBuffer = await pdfService.generateKitChecklist(kit, items, {
      includeSignature: includeSignature === 'true',
      includeNotes: includeNotes === 'true'
    });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="kit-checklist-${kit.name.replace(/\s/g, '-')}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Generate PDF and save to server
router.post('/kit/:kitId/save', async (req, res) => {
  try {
    const { kitId } = req.params;
    const { outputPath } = req.body;
    
    const kit = await Kit.findById(kitId);
    const items = await KitItem.find({ kitId: kitId });
    
    const savedPath = await pdfService.saveToFile(
      kit, 
      items, 
      outputPath || `./pdfs/kit-${kitId}-${Date.now()}.pdf`
    );
    
    res.json({ 
      success: true, 
      path: savedPath,
      message: 'PDF saved successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk PDF generation
router.post('/bulk', async (req, res) => {
  try {
    const { kitIds } = req.body;
    
    const kitsData = [];
    for (const kitId of kitIds) {
      const kit = await Kit.findById(kitId);
      const items = await KitItem.find({ kitId: kitId });
      kitsData.push({ kit, items });
    }
    
    const pdfs = await pdfService.generateBulkChecklists(kitsData);
    
    // Create a ZIP file if multiple PDFs
    if (pdfs.length > 1) {
      const archiver = require('archiver');
      const zipBuffer = await createZipArchive(pdfs);
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="kit-checklists.zip"');
      res.send(zipBuffer);
    } else if (pdfs.length === 1) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${pdfs[0].kitName}-checklist.pdf"`);
      res.send(pdfs[0].pdfBuffer);
    } else {
      res.status(404).json({ error: 'No kits found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to create ZIP archive
async function createZipArchive(pdfs) {
  const archiver = require('archiver');
  const stream = require('stream');
  const bufferStream = new stream.PassThrough();
  const archive = archiver('zip', { zlib: { level: 9 } });
  
  archive.pipe(bufferStream);
  
  for (const pdf of pdfs) {
    archive.append(pdf.pdfBuffer, { name: `${pdf.kitName}-checklist.pdf` });
  }
  
  await archive.finalize();
  
  const chunks = [];
  for await (const chunk of bufferStream) {
    chunks.push(chunk);
  }
  
  return Buffer.concat(chunks);
}

// Preview PDF in browser
router.get('/kit/:kitId/preview', async (req, res) => {
  try {
    const { kitId } = req.params;
    
    const kit = await Kit.findById(kitId);
    const items = await KitItem.find({ kitId: kitId });
    
    const pdfBuffer = await pdfService.generateKitChecklist(kit, items, {
      includeSignature: false,
      includeNotes: true
    });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;