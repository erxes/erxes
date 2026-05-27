const PRINT_STYLES = `
  body {
    font-family: Arial, sans-serif;
    margin: 16px;
    color: #000;
    font-size: 12px;
    line-height: 1.45;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .bg-gray-50 {
    background-color: #fff;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;
    border: 1px solid #d4d4d4;
  }
  .grid {
    display: grid;
    gap: 16px;
  }
  .grid-cols-2 {
    grid-template-columns: 1fr 1fr;
  }
  .border-b-2 {
    border-bottom: 1px solid #cfcfcf;
    padding-bottom: 16px;
    margin-bottom: 24px;
  }
  .border-t {
    border-top: 1px solid #cfcfcf;
    padding-top: 16px;
    margin-top: 32px;
  }
  .space-y-2 > * + * {
    margin-top: 8px;
  }
  .font-semibold {
    font-weight: 600;
  }
  .font-bold {
    font-weight: 700;
  }
  .text-center {
    text-align: center;
  }
  .text-sm {
    font-size: 14px;
  }
  .text-gray-600 {
    color: #222;
  }
  .text-gray-700 {
    color: #111;
  }
  .mb-2 {
    margin-bottom: 8px;
  }
  .mb-4 {
    margin-bottom: 16px;
  }
  .mb-6 {
    margin-bottom: 24px;
  }
  .ml-2 {
    margin-left: 8px;
  }
  .mt-8 {
    margin-top: 32px;
  }
  .pt-4 {
    padding-top: 16px;
  }
  .p-4 {
    padding: 16px;
  }
  .p-6 {
    padding: 24px;
  }
  .pb-4 {
    padding-bottom: 16px;
  }
  .max-w-2xl {
    max-width: 672px;
  }
  .mx-auto {
    margin-left: auto;
    margin-right: auto;
  }
  .rounded-lg {
    border-radius: 8px;
  }
  .bg-blue-50 {
    background-color: #fff;
  }
  .border-blue-200 {
    border-color: #cfcfcf;
  }
  .text-blue-600 {
    color: #111;
  }
  .text-green-600 {
    color: #111;
  }
  .italic {
    font-style: italic;
  }
  @media print {
    body {
      margin: 0;
    }
    .bg-gray-50 {
      background-color: #fff !important;
    }
    .bg-blue-50 {
      background-color: #fff !important;
    }
    .border-blue-200 {
      border-color: #cfcfcf !important;
    }
  }
`

export const replaceTemplateVariables = (
  content: string,
  variables: Record<string, string>
): string => {
  return Object.entries(variables).reduce((acc, [key, value]) => {
    const pattern = new RegExp(`{{${key}}}`, "g")
    return acc.replace(pattern, value || "N/A")
  }, content)
}

export const createPrintDocument = (content: string): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Payment Supplement</title>
        <style>${PRINT_STYLES}</style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `
}
