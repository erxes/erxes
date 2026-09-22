export const getPrintDocumentStyles = (
  pageWidth: number,
  pageHeight: number,
) => `
  @page {
    size: ${pageWidth}mm ${pageHeight}mm;
    margin: 0;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    color: #18181b;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  body {
    padding: 24px;
    background: #f4f4f5;
  }

  .label-item {
    width: ${pageWidth}mm !important;
    min-height: ${pageHeight}mm !important;
    margin: 0 auto 24px !important;
    padding: 12mm 14mm !important;
    overflow: visible !important;
    background: #ffffff;
    box-shadow: 0 8px 30px rgba(24, 24, 27, 0.12);
    break-after: page;
    page-break-after: always;
  }

  .label-item:last-child {
    margin-bottom: 0 !important;
    break-after: auto;
    page-break-after: auto;
  }

  .label-item > :first-child {
    margin-top: 0 !important;
  }

  .label-item h1 {
    margin: 0 0 12px !important;
    font-size: 20px !important;
    line-height: 1.3 !important;
  }

  .label-item h2 {
    margin: 14px 0 10px !important;
    font-size: 17px !important;
    line-height: 1.35 !important;
  }

  .label-item h3 {
    margin: 12px 0 8px !important;
    font-size: 15px !important;
    line-height: 1.4 !important;
  }

  .label-item p {
    margin: 0 0 10px !important;
    font-size: 13px !important;
    line-height: 1.45 !important;
  }

  .label-item table {
    width: 100% !important;
    margin: 12px 0 !important;
    table-layout: auto !important;
    border-collapse: collapse !important;
    font-size: 12px;
    line-height: 1.4;
  }

  .label-item thead {
    display: table-header-group;
  }

  .label-item tfoot {
    display: table-footer-group;
  }

  .label-item th,
  .label-item td {
    padding: 6px 8px !important;
    vertical-align: middle;
    word-break: break-word;
  }

  .label-item th {
    color: #27272a;
    font-weight: 600;
    text-align: left;
    border-bottom: 1px dashed #a1a1aa;
  }

  .label-item tbody td {
    border-bottom: 1px dashed #e4e4e7;
  }

  .label-item tbody tr:last-child td {
    border-bottom: 0;
  }

  .label-item tr {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  @media print {
    html,
    body {
      padding: 0;
      background: #ffffff;
    }

    .label-item {
      margin: 0 !important;
      box-shadow: none;
    }
  }
`;

export const PRINT_LOADING_STYLES = `
  body {
    min-height: 100vh;
    margin: 0;
    display: grid;
    place-items: center;
    background: #f4f4f5;
    color: #71717a;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  }

  .print-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    font-weight: 500;
  }

  .print-loading-spinner {
    width: 28px;
    height: 28px;
    border: 3px solid #e4e4e7;
    border-top-color: #5b4ce6;
    border-radius: 9999px;
    animation: print-loading-spin 0.8s linear infinite;
  }

  @keyframes print-loading-spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
