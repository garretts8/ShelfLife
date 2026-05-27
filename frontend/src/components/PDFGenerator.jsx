// components/PDFGenerator.jsx
import React, { useState } from 'react';
import axios from 'axios';

const PDFGenerator = ({ kitId, kitName }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [options, setOptions] = useState({
    includeSignature: true,
    includeNotes: true
  });

  const generatePDF = async (action = 'download') => {
    setIsGenerating(true);
    try {
      const params = new URLSearchParams(options);
      const url = `/api/pdf/kit/${kitId}?${params.toString()}`;
      
      if (action === 'preview') {
        window.open(url.replace('download', 'preview'), '_blank');
      } else {
        const response = await axios.get(url, {
          responseType: 'blob'
        });
        
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `kit-checklist-${kitName}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateBulkPDF = async (kitIds) => {
    setIsGenerating(true);
    try {
      const response = await axios.post('/api/pdf/bulk', 
        { kitIds },
        { responseType: 'blob' }
      );
      
      const blob = new Blob([response.data]);
      const contentType = response.headers['content-type'];
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      
      if (contentType.includes('zip')) {
        link.download = 'kit-checklists.zip';
      } else {
        link.download = 'kit-checklist.pdf';
      }
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Bulk PDF generation failed:', error);
      alert('Failed to generate PDFs. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="pdf-generator">
      <h3>Generate Checklist PDF</h3>
      
      <div className="pdf-options">
        <label>
          <input
            type="checkbox"
            checked={options.includeSignature}
            onChange={(e) => setOptions({
              ...options,
              includeSignature: e.target.checked
            })}
          />
          Include Signature Section
        </label>
        
        <label>
          <input
            type="checkbox"
            checked={options.includeNotes}
            onChange={(e) => setOptions({
              ...options,
              includeNotes: e.target.checked
            })}
          />
          Include Notes Column
        </label>
      </div>
      
      <div className="pdf-actions">
        <button 
          onClick={() => generatePDF('preview')} 
          disabled={isGenerating}
          className="btn-preview"
        >
          Preview PDF
        </button>
        
        <button 
          onClick={() => generatePDF('download')} 
          disabled={isGenerating}
          className="btn-download"
        >
          {isGenerating ? 'Generating...' : 'Download PDF'}
        </button>
        
        <button 
          onClick={() => generateBulkPDF([kitId])} 
          disabled={isGenerating}
          className="btn-bulk"
        >
          Generate with Related Kits
        </button>
      </div>
    </div>
  );
};

export default PDFGenerator;