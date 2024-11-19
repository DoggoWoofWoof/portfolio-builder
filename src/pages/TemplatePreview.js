// src/pages/TemplatePreview.js
import React, { useRef } from 'react';
import { useLocation } from 'react-router-dom';

const TemplatePreview = () => {
  const { state } = useLocation();
  const { title, htmlContent } = state || {};
  const previewRef = useRef(null);

  const handleDownload = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.html`; // Name the downloaded file
    link.click();
    URL.revokeObjectURL(url); // Cleanup the URL object
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      previewRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div>
      <h1>{title} Preview</h1>
      <div ref={previewRef} dangerouslySetInnerHTML={{ __html: htmlContent }} style={{ border: '1px solid #ccc', padding: '20px', overflow: 'auto' }} />
      <div>
        <button onClick={toggleFullScreen}>Toggle Full Screen</button>
        <button onClick={handleDownload}>Download HTML</button>
      </div>
    </div>
  );
};

export default TemplatePreview;
