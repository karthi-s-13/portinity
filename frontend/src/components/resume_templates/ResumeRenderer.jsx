import React, { useEffect, useState, useRef } from 'react';
import { RESUME_TEMPLATES } from './index';

export default function ResumeRenderer({ templateId, data, containerRef }) {
  const selectedTpl = RESUME_TEMPLATES.find((t) => t.id === templateId) || RESUME_TEMPLATES[0];
  const TemplateComp = selectedTpl.component;

  const wrapperRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const handleResize = () => {
      const parent = el.parentElement;
      if (parent) {
        // Measure parent width minus padding/margins (32px offset for generous whitespace)
        const parentWidth = parent.clientWidth - 32;
        const targetWidth = 794; // 210mm in px at 96 dpi
        
        let newScale = 1;
        if (parentWidth < targetWidth) {
          newScale = parentWidth / targetWidth;
        }
        
        setScale(newScale);
      }
    };

    // Run initial calculation after a short timeout to let fonts and layout stabilize
    const timer = setTimeout(handleResize, 100);

    // Setup ResizeObserver for container changes
    let observer;
    if (typeof ResizeObserver !== 'undefined' && el.parentElement) {
      observer = new ResizeObserver(handleResize);
      observer.observe(el.parentElement);
    } else {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      clearTimeout(timer);
      if (observer) {
        observer.disconnect();
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, [data, templateId]);

  // Merge the refs
  const handleRef = (node) => {
    wrapperRef.current = node;
    if (containerRef) {
      if (typeof containerRef === 'function') {
        containerRef(node);
      } else {
        containerRef.current = node;
      }
    }
  };

  return (
    <div style={{ padding: '16px 8px', display: 'flex', justifyContent: 'center', width: '100%' }}>
      <div 
        ref={handleRef} 
        className="resume-pdf-export-wrapper" 
        style={{ 
          backgroundColor: '#ffffff', 
          padding: '0', 
          width: '794px', // 210mm in pixels at 96dpi (standard A4 width)
          minHeight: '1123px', // 297mm in pixels at 96dpi (standard A4 height)
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12)', // Professional paper drop shadow
          border: '1px solid #e2e8f0', // Clean page border
          borderRadius: '4px',
          zoom: scale,
          margin: '0 auto',
          boxSizing: 'border-box',
          overflow: 'hidden' // Force single page layout constraint for A4 size preview
        }}
      >
        <TemplateComp data={data} accentColor={selectedTpl.accentColor} templateId={selectedTpl.id} />
      </div>
    </div>
  );
}
