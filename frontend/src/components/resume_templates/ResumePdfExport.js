import api from '../../api/axios';

/**
 * High-quality PDF Exporter using backend Chromium Puppeteer rendering
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

  // Collect all stylesheets and link tags from head to compile a self-contained HTML payload
  const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(el => el.outerHTML)
    .join('\n');

  // Wrap the element in a standard HTML scaffold
  const selfContainedHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Resume Export</title>
        ${styleTags}
        <style>
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        </style>
      </head>
      <body>
        ${clone.outerHTML}
      </body>
    </html>
  `;

  // Make the post call to the backend compile-html-pdf endpoint
  const response = await api.post('/ai-resume/compile-html-pdf', {
    html_content: selfContainedHtml
  }, {
    responseType: 'blob'
  });

  // Create a download link for the compiled PDF blob
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);

  return true;
}
