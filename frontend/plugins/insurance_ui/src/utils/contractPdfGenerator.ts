interface Contract {
  contractNumber: string;
  paymentStatus: string;
  vendor?: { name: string };
  customer?: {
    firstName: string;
    lastName: string;
    registrationNumber?: string;
    email?: string;
    phone?: string;
    companyName?: string;
  };
  insuranceType?: { name: string };
  insuranceProduct?: { name: string; pdfContent?: string };
  startDate: Date;
  endDate: Date;
  paymentKind: string;
  chargedAmount: number;
  coveredRisks?: Array<{
    risk?: { name: string };
    coveragePercentage: number;
  }>;
  insuredObject?: Record<string, any>;
  createdAt: Date;
}

const TEMPLATE_STORAGE_KEY = 'insurance_contract_template';

const SHARED_STYLES = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.6; color: #333; padding: 20px; background: white; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #2563eb; padding-bottom: 20px; }
    .header h1 { color: #2563eb; font-size: 24pt; margin-bottom: 10px; }
    .header .contract-number { font-size: 14pt; color: #666; font-weight: bold; }
    .section { margin-bottom: 25px; }
    .section-title { background-color: #2563eb; color: white; padding: 8px 12px; font-size: 14pt; font-weight: bold; margin-bottom: 15px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
    .info-item { padding: 10px; background-color: #f8f9fa; border-left: 3px solid #2563eb; }
    .info-label { font-weight: bold; color: #666; font-size: 10pt; margin-bottom: 5px; }
    .info-value { font-size: 12pt; color: #333; }
    .amount-box { background-color: #dbeafe; border: 2px solid #2563eb; padding: 20px; text-align: center; margin: 20px 0; }
    .amount-label { font-size: 12pt; color: #666; margin-bottom: 5px; }
    .amount-value { font-size: 28pt; font-weight: bold; color: #2563eb; }
    .risks-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .risks-table th, .risks-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    .risks-table th { background-color: #f3f4f6; font-weight: bold; }
    .object-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 10px; }
    .object-item { padding: 8px; background-color: #f8f9fa; border-radius: 4px; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #ddd; }
    .signature-section { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; margin-top: 40px; }
    .signature-box { text-align: center; }
    .signature-line { border-top: 1px solid #333; margin-top: 60px; padding-top: 10px; }
    .status-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 10pt; font-weight: bold; }
    .status-paid { background-color: #dcfce7; color: #166534; }
    .status-pending { background-color: #fef3c7; color: #854d0e; }
`;

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('mn-MN').format(amount) + '₮';
};

function applyTemplatePlaceholders(
  template: string,
  contract: Contract,
): string {
  const insuredObject = contract.insuredObject || {};
  const carValuation =
    insuredObject.carValuation ||
    insuredObject.valuation ||
    insuredObject.price;

  return template
    .replace(/\{\{contractNumber\}\}/g, contract.contractNumber || '')
    .replace(/\{\{vendorName\}\}/g, contract.vendor?.name || 'N/A')
    .replace(
      /\{\{customerName\}\}/g,
      `${contract.customer?.firstName || ''} ${
        contract.customer?.lastName || ''
      }`.trim() || 'N/A',
    )
    .replace(
      /\{\{registrationNumber\}\}/g,
      contract.customer?.registrationNumber || 'N/A',
    )
    .replace(/\{\{insuranceType\}\}/g, contract.insuranceType?.name || 'N/A')
    .replace(/\{\{productName\}\}/g, contract.insuranceProduct?.name || 'N/A')
    .replace(/\{\{startDate\}\}/g, formatDate(contract.startDate))
    .replace(/\{\{endDate\}\}/g, formatDate(contract.endDate))
    .replace(/\{\{chargedAmount\}\}/g, formatCurrency(contract.chargedAmount))
    .replace(
      /\{\{carBrand\}\}/g,
      insuredObject.carBrand ||
        insuredObject.brand ||
        insuredObject.mark ||
        'N/A',
    )
    .replace(
      /\{\{carModel\}\}/g,
      insuredObject.carModel ||
        insuredObject.model ||
        insuredObject.zagvar ||
        'N/A',
    )
    .replace(
      /\{\{carYear\}\}/g,
      insuredObject.carYear ||
        insuredObject.year ||
        insuredObject.manufacturingYear ||
        'N/A',
    )
    .replace(
      /\{\{plateNumber\}\}/g,
      insuredObject.plateNumber ||
        insuredObject.ulsNumber ||
        insuredObject.licensePlate ||
        'N/A',
    )
    .replace(
      /\{\{vinNumber\}\}/g,
      insuredObject.vinNumber ||
        insuredObject.vin ||
        insuredObject.chassisNumber ||
        'N/A',
    )
    .replace(
      /\{\{engineNumber\}\}/g,
      insuredObject.engineNumber || insuredObject.motorNumber || 'N/A',
    )
    .replace(
      /\{\{carColor\}\}/g,
      insuredObject.carColor ||
        insuredObject.color ||
        insuredObject.ongo ||
        'N/A',
    )
    .replace(
      /\{\{carValuation\}\}/g,
      carValuation ? formatCurrency(carValuation) : 'N/A',
    );
}

function generateDynamicSections(contract: Contract): string {
  let sections = '';

  if (contract.coveredRisks && contract.coveredRisks.length > 0) {
    sections += `
  <div class="section">
    <div class="section-title">Хамгаалагдсан эрсдлүүд</div>
    <table class="risks-table">
      <thead>
        <tr>
          <th>Эрсдлийн төрөл</th>
          <th style="text-align: center; width: 150px;">Хамгаалалтын хувь</th>
        </tr>
      </thead>
      <tbody>
        ${contract.coveredRisks
          .map(
            (cr) => `
        <tr>
          <td>${cr.risk?.name || 'N/A'}</td>
          <td style="text-align: center; font-weight: bold;">${
            cr.coveragePercentage
          }%</td>
        </tr>`,
          )
          .join('')}
      </tbody>
    </table>
  </div>`;
  }

  if (
    contract.insuredObject &&
    Object.keys(contract.insuredObject).length > 0
  ) {
    sections += `
  <div class="section">
    <div class="section-title">Даатгалын зүйлийн мэдээлэл</div>
    <div class="object-grid">
      ${Object.entries(contract.insuredObject)
        .map(
          ([key, value]) => `
      <div class="object-item">
        <div class="info-label">${key}</div>
        <div class="info-value">${
          typeof value === 'boolean' ? (value ? 'Тийм' : 'Үгүй') : value
        }</div>
      </div>`,
        )
        .join('')}
    </div>
  </div>`;
  }

  return sections;
}

function generateContractHTML(contract: Contract): string {
  // First priority: use product's pdfContent if available
  const productTemplate = contract.insuranceProduct?.pdfContent;

  if (productTemplate) {
    return applyTemplatePlaceholders(productTemplate, contract);
  }

  // Second priority: use localStorage template (legacy support)
  const savedTemplate = localStorage.getItem(TEMPLATE_STORAGE_KEY);

  if (savedTemplate) {
    return applyTemplatePlaceholders(savedTemplate, contract);
  }

  // Build default template with dynamic sections
  const statusClass =
    contract.paymentStatus === 'paid' ? 'status-paid' : 'status-pending';
  const statusText = contract.paymentStatus === 'paid' ? 'Paid' : 'Pending';
  const paymentKindText =
    contract.paymentKind === 'cash' ? 'Бэлэн мөнгө' : 'QPay';
  const dynamicSections = generateDynamicSections(contract);

  const customerExtras = [
    contract.customer?.email
      ? `<div class="info-item"><div class="info-label">Email</div><div class="info-value">${contract.customer.email}</div></div>`
      : '',
    contract.customer?.phone
      ? `<div class="info-item"><div class="info-label">Phone</div><div class="info-value">${contract.customer.phone}</div></div>`
      : '',
    contract.customer?.companyName
      ? `<div class="info-item"><div class="info-label">Organization Name</div><div class="info-value">${contract.customer.companyName}</div></div>`
      : '',
  ].join('');

  return `<!DOCTYPE html>
<html lang="mn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Insurance Contract - ${contract.contractNumber}</title>
  <style>${SHARED_STYLES}</style>
</head>
<body>
  <div class="header">
    <h1>INSURANCE CONTRACT</h1>
    <div class="contract-number">Contract Number: ${
      contract.contractNumber
    }</div>
    <div style="margin-top: 10px;"><span class="status-badge ${statusClass}">${statusText}</span></div>
  </div>

  <div class="section">
    <div class="section-title">Даатгалын компани</div>
    <div class="info-grid">
      <div class="info-item"><div class="info-label">Компанийн нэр</div><div class="info-value">${
        contract.vendor?.name || 'N/A'
      }</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Даатгуулагч</div>
    <div class="info-grid">
      <div class="info-item"><div class="info-label">Овог нэр</div><div class="info-value">${
        contract.customer?.firstName || ''
      } ${contract.customer?.lastName || ''}</div></div>
      <div class="info-item"><div class="info-label">Registration Number</div><div class="info-value">${
        contract.customer?.registrationNumber || 'N/A'
      }</div></div>
      ${customerExtras}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Даатгалын мэдээлэл</div>
    <div class="info-grid">
      <div class="info-item"><div class="info-label">Даатгалын төрөл</div><div class="info-value">${
        contract.insuranceType?.name || 'N/A'
      }</div></div>
      <div class="info-item"><div class="info-label">Бүтээгдэхүүн</div><div class="info-value">${
        contract.insuranceProduct?.name || 'N/A'
      }</div></div>
      <div class="info-item"><div class="info-label">Эхлэх огноо</div><div class="info-value">${formatDate(
        contract.startDate,
      )}</div></div>
      <div class="info-item"><div class="info-label">Дуусах огноо</div><div class="info-value">${formatDate(
        contract.endDate,
      )}</div></div>
      <div class="info-item"><div class="info-label">Төлбөрийн хэлбэр</div><div class="info-value">${paymentKindText}</div></div>
    </div>
  </div>

  <div class="amount-box">
    <div class="amount-label">Нийт хураамж</div>
    <div class="amount-value">${formatCurrency(contract.chargedAmount)}</div>
  </div>

  ${dynamicSections}

  <div class="footer">
    <div class="signature-section">
      <div class="signature-box"><div style="font-weight: bold; margin-bottom: 10px;">Даатгалын компани</div><div class="signature-line">Гарын үсэг, тамга</div></div>
      <div class="signature-box"><div style="font-weight: bold; margin-bottom: 10px;">Даатгуулагч</div><div class="signature-line">Гарын үсэг</div></div>
    </div>
    <div style="margin-top: 30px; text-align: center; color: #666; font-size: 10pt;"><p>Гэрээ үүсгэсэн огноо: ${formatDate(
      contract.createdAt,
    )}</p></div>
  </div>
</body>
</html>`;
}

export function generateContractPDF(contract: Contract): void {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    alert('Popup блоклогдсон байна. Popup зөвшөөрнө үү.');
    return;
  }

  // Write HTML to the new window
  printWindow.document.write(generateContractHTML(contract));
  printWindow.document.close();

  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    // Close window after printing (user can cancel)
    setTimeout(() => {
      printWindow.close();
    }, 100);
  };
}

export function downloadContractHTML(contract: Contract): void {
  // Generate HTML
  const html = generateContractHTML(contract);

  // Create blob
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  // Create download link
  const link = document.createElement('a');
  link.href = url;
  link.download = `contract_${contract.contractNumber}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
}

export { generateContractHTML };

export function generatePdfFromProductTemplate(
  pdfContent: string,
  contract: Contract,
): string {
  return applyTemplatePlaceholders(pdfContent, contract);
}

export function getDefaultPdfTemplate(): string {
  return `<!DOCTYPE html>
<html lang="mn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Даатгалын гэрээ - {{contractNumber}}</title>
  <style>${SHARED_STYLES}</style>
</head>
<body>
  <div class="header">
    <h1>ДААТГАЛЫН ГЭРЭЭ</h1>
    <div class="contract-number">Гэрээний дугаар: {{contractNumber}}</div>
  </div>

  <div class="section">
    <div class="section-title">Даатгалын компани</div>
    <div class="info-grid">
      <div class="info-item"><div class="info-label">Компанийн нэр</div><div class="info-value">{{vendorName}}</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Даатгуулагч</div>
    <div class="info-grid">
      <div class="info-item"><div class="info-label">Овог нэр</div><div class="info-value">{{customerName}}</div></div>
      <div class="info-item"><div class="info-label">Registration Number</div><div class="info-value">{{registrationNumber}}</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Даатгалын мэдээлэл</div>
    <div class="info-grid">
      <div class="info-item"><div class="info-label">Даатгалын төрөл</div><div class="info-value">{{insuranceType}}</div></div>
      <div class="info-item"><div class="info-label">Бүтээгдэхүүн</div><div class="info-value">{{productName}}</div></div>
      <div class="info-item"><div class="info-label">Эхлэх огноо</div><div class="info-value">{{startDate}}</div></div>
      <div class="info-item"><div class="info-label">Дуусах огноо</div><div class="info-value">{{endDate}}</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Даатгалын зүйлийн мэдээлэл (Автомашин)</div>
    <div class="info-grid">
      <div class="info-item"><div class="info-label">Марк</div><div class="info-value">{{carBrand}}</div></div>
      <div class="info-item"><div class="info-label">Загвар</div><div class="info-value">{{carModel}}</div></div>
      <div class="info-item"><div class="info-label">Үйлдвэрлэсэн он</div><div class="info-value">{{carYear}}</div></div>
      <div class="info-item"><div class="info-label">Улсын дугаар</div><div class="info-value">{{plateNumber}}</div></div>
      <div class="info-item"><div class="info-label">Арлын дугаар (VIN)</div><div class="info-value">{{vinNumber}}</div></div>
      <div class="info-item"><div class="info-label">Мотор дугаар</div><div class="info-value">{{engineNumber}}</div></div>
      <div class="info-item"><div class="info-label">Өнгө</div><div class="info-value">{{carColor}}</div></div>
      <div class="info-item"><div class="info-label">Үнэлгээний дүн</div><div class="info-value">{{carValuation}}</div></div>
    </div>
  </div>

  <div class="amount-box">
    <div class="amount-label">Нийт хураамж</div>
    <div class="amount-value">{{chargedAmount}}</div>
  </div>

  <div class="footer">
    <div class="signature-section">
      <div class="signature-box"><div style="font-weight: bold; margin-bottom: 10px;">Даатгалын компани</div><div class="signature-line">Гарын үсэг, тамга</div></div>
      <div class="signature-box"><div style="font-weight: bold; margin-bottom: 10px;">Даатгуулагч</div><div class="signature-line">Гарын үсэг</div></div>
    </div>
  </div>
</body>
</html>`;
}
