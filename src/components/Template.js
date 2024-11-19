// src/components/Template.js
import React from 'react';

const Template = ({ title, htmlContent, background }) => {
  return (
    <div className="template" style={{ border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden', backgroundColor: background }}>
      <h2 style={{ textAlign: 'center', padding: '10px', background: '#f1f1f1', margin: 0 }}>{title}</h2>
      <div
        className="template-content"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        style={{ padding: '20px' }}
      />
    </div>
  );
};

export default Template;
