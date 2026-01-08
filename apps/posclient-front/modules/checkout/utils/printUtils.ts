const PRINT_STYLES = `
  body {
    font-family: Arial, sans-serif;
    margin: 20px;
    color: black;
    line-height: 1.6;
  }
  .bg-gray-50 {
    background-color: #f9f9f9;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;
  }
  .grid {
    display: grid;
    gap: 16px;
  }
  .grid-cols-2 {
    grid-template-columns: 1fr 1fr;
  }
  .border-b-2 {
    border-bottom: 2px solid #d1d5db;
    padding-bottom: 16px;
    margin-bottom: 24px;
  }
  .border-t {
    border-top: 1px solid #d1d5db;
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
    color: #6b7280;
  }
  .text-gray-700 {
    color: #374151;
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
    background-color: #eff6ff;
  }
  .border-blue-200 {
    border-color: #bfdbfe;
  }
  .text-blue-600 {
    color: #2563eb;
  }
  .text-green-600 {
    color: #16a34a;
  }
  .italic {
    font-style: italic;
  }
  @media print {
    body {
      margin: 0;
    }
    .bg-gray-50 {
      background-color: #f5f5f5 !important;
    }
    .bg-blue-50 {
      background-color: #f0f9ff !important;
    }
    .border-blue-200 {
      border-color: #bfdbfe !important;
    }
  }
`

export const replaceTemplateVariables = (
  content: string, 
  variables: Record<string, string>
): string => {
  return Object.entries(variables).reduce((acc, [key, value]) => {
    const pattern = new RegExp(`{{${key}}}`, 'g')
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