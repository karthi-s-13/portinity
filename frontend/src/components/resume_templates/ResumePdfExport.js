import html2pdf from 'html2pdf.js';

/**
 * High-quality PDF Exporter using html2pdf.js
 * @param {HTMLElement} element - Target HTML container element
 * @param {string} fileName - Output PDF filename
 */
export async function downloadResumePdf(element, fileName = 'Tailored_Resume.pdf') {
  if (!element) {
    throw new Error('Target element for PDF export not found.');
  }

  // Clone the node so we don't disrupt the screen preview styling
  const clone = element.cloneNode(true);

  // Enforce strict A4 single-page dimensions and hide any overflow spillovers
  clone.style.zoom = '1';
  clone.style.transform = 'none';
  clone.style.margin = '0';
  clone.style.boxShadow = 'none';
  clone.style.border = 'none';
  clone.style.borderRadius = '0';
  clone.style.position = 'relative';
  clone.style.left = '0';
  clone.style.top = '0';
  clone.style.width = '210mm';
  clone.style.height = '297mm';
  clone.style.minHeight = '297mm';
  clone.style.overflow = 'hidden';
  clone.style.boxSizing = 'border-box';

  // Also apply A4 single-page constraints to the actual template component inside the wrapper
  if (clone.firstElementChild) {
    clone.firstElementChild.style.width = '210mm';
    clone.firstElementChild.style.height = '297mm';
    clone.firstElementChild.style.minHeight = '297mm';
    clone.firstElementChild.style.overflow = 'hidden';
    clone.firstElementChild.style.boxSizing = 'border-box';
    clone.firstElementChild.style.margin = '0';
  }

  // Temporarily attach to DOM in a hidden container so CSS layouts render correctly
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.width = '210mm'; // Maintain exact A4 width boundary
  container.appendChild(clone);
  document.body.appendChild(container);

  const opt = {
    margin: 0,
    filename: fileName,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2.5, 
      useCORS: true, 
      letterRendering: true,
      backgroundColor: '#ffffff'
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    await html2pdf().set(opt).from(clone).save();
    document.body.removeChild(container);
    return true;
  } catch (err) {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
    console.error('PDF export error:', err);
    throw err;
  }
}
