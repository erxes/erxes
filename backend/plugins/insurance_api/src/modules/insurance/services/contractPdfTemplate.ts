export function generateContractHTML(contract: any): string {
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

  return `
<!DOCTYPE html>
<html lang="mn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Даатгалын гэрээ - ${contract.contractNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: Arial, sans-serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #333;
      padding: 20px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
    }
    
    .header h1 {
      color: #2563eb;
      font-size: 24pt;
      margin-bottom: 10px;
    }
    
    .header .contract-number {
      font-size: 14pt;
      color: #666;
      font-weight: bold;
    }
    
    .section {
      margin-bottom: 25px;
    }
    
    .section-title {
      background-color: #2563eb;
      color: white;
      padding: 8px 12px;
      font-size: 14pt;
      font-weight: bold;
      margin-bottom: 15px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 15px;
    }
    
    .info-item {
      padding: 10px;
      background-color: #f8f9fa;
      border-left: 3px solid #2563eb;
    }
    
    .info-label {
      font-weight: bold;
      color: #666;
      font-size: 10pt;
      margin-bottom: 5px;
    }
    
    .info-value {
      font-size: 12pt;
      color: #333;
    }
    
    .amount-box {
      background-color: #dbeafe;
      border: 2px solid #2563eb;
      padding: 20px;
      text-align: center;
      margin: 20px 0;
    }
    
    .amount-label {
      font-size: 12pt;
      color: #666;
      margin-bottom: 5px;
    }
    
    .amount-value {
      font-size: 28pt;
      font-weight: bold;
      color: #2563eb;
    }
    
    .risks-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    
    .risks-table th,
    .risks-table td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }
    
    .risks-table th {
      background-color: #f3f4f6;
      font-weight: bold;
    }
    
    .object-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 10px;
    }
    
    .object-item {
      padding: 8px;
      background-color: #f8f9fa;
      border-radius: 4px;
    }
    
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #ddd;
    }
    
    .signature-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 50px;
      margin-top: 40px;
    }
    
    .signature-box {
      text-align: center;
    }
    
    .signature-line {
      border-top: 1px solid #333;
      margin-top: 60px;
      padding-top: 10px;
    }
    
    .status-badge {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 10pt;
      font-weight: bold;
    }
    
    .status-paid {
      background-color: #dcfce7;
      color: #166534;
    }
    
    .status-pending {
      background-color: #fef3c7;
      color: #854d0e;
    }
    
    @media print {
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>ДААТГАЛЫН ГЭРЭЭ</h1>
    <div class="contract-number">Гэрээний дугаар: ${
      contract.contractNumber
    }</div>
    <div style="margin-top: 10px;">
      <span class="status-badge ${
        contract.paymentStatus === 'paid' ? 'status-paid' : 'status-pending'
      }">
        ${contract.paymentStatus === 'paid' ? 'Төлсөн' : 'Хүлээгдэж буй'}
      </span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Даатгалын компани</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Компанийн нэр</div>
        <div class="info-value">${contract.vendor?.name || 'N/A'}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Даатгуулагч</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Овог нэр</div>
        <div class="info-value">${contract.customer?.firstName || ''} ${
    contract.customer?.lastName || ''
  }</div>
      </div>
      <div class="info-item">
        <div class="info-label">Регистрийн дугаар</div>
        <div class="info-value">${
          contract.customer?.registrationNumber || 'N/A'
        }</div>
      </div>
      ${
        contract.customer?.email
          ? `
      <div class="info-item">
        <div class="info-label">Имэйл</div>
        <div class="info-value">${contract.customer.email}</div>
      </div>
      `
          : ''
      }
      ${
        contract.customer?.phone
          ? `
      <div class="info-item">
        <div class="info-label">Утас</div>
        <div class="info-value">${contract.customer.phone}</div>
      </div>
      `
          : ''
      }
      ${
        contract.customer?.companyName
          ? `
      <div class="info-item">
        <div class="info-label">Байгууллагын нэр</div>
        <div class="info-value">${contract.customer.companyName}</div>
      </div>
      `
          : ''
      }
    </div>
  </div>

  <div class="section">
    <div class="section-title">Даатгалын мэдээлэл</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Даатгалын төрөл</div>
        <div class="info-value">${contract.insuranceType?.name || 'N/A'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Бүтээгдэхүүн</div>
        <div class="info-value">${
          contract.insuranceProduct?.name || 'N/A'
        }</div>
      </div>
      <div class="info-item">
        <div class="info-label">Эхлэх огноо</div>
        <div class="info-value">${formatDate(contract.startDate)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Дуусах огноо</div>
        <div class="info-value">${formatDate(contract.endDate)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Төлбөрийн хэлбэр</div>
        <div class="info-value">${
          contract.paymentKind === 'cash' ? 'Бэлэн мөнгө' : 'QPay'
        }</div>
      </div>
    </div>
  </div>

  <div class="amount-box">
    <div class="amount-label">Нийт хураамж</div>
    <div class="amount-value">${formatCurrency(contract.chargedAmount)}</div>
  </div>

  ${
    contract.coveredRisks && contract.coveredRisks.length > 0
      ? `
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
            (cr: any) => `
        <tr>
          <td>${cr.risk?.name || 'N/A'}</td>
          <td style="text-align: center; font-weight: bold;">${
            cr.coveragePercentage
          }%</td>
        </tr>
        `,
          )
          .join('')}
      </tbody>
    </table>
  </div>
  `
      : ''
  }

  ${
    contract.insuredObject && Object.keys(contract.insuredObject).length > 0
      ? `
  <div class="section">
    <div class="section-title">Даатгалын зүйлийн мэдээлэл</div>
    <div class="object-grid">
      ${Object.entries(contract.insuredObject)
        .map(
          ([key, value]: [string, any]) => `
      <div class="object-item">
        <div class="info-label">${key}</div>
        <div class="info-value">${
          typeof value === 'boolean' ? (value ? 'Тийм' : 'Үгүй') : value
        }</div>
      </div>
      `,
        )
        .join('')}
    </div>
  </div>
  `
      : ''
  }

  <div class="footer">
    <div class="signature-section">
      <div class="signature-box">
        <div style="font-weight: bold; margin-bottom: 10px;">Даатгалын компани</div>
        <div class="signature-line">Гарын үсэг, тамга</div>
      </div>
      <div class="signature-box">
        <div style="font-weight: bold; margin-bottom: 10px;">Даатгуулагч</div>
        <div class="signature-line">Гарын үсэг</div>
      </div>
    </div>
    
    <div style="margin-top: 30px; text-align: center; color: #666; font-size: 10pt;">
      <p>Гэрээ үүсгэсэн огноо: ${formatDate(contract.createdAt)}</p>
    </div>
  </div>
</body>
</html>
  `;
}
