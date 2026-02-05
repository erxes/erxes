import { useState, useEffect } from 'react';
import {
  IconFileText,
  IconEye,
  IconDownload,
  IconPrinter,
  IconCode,
  IconDeviceFloppy,
} from '@tabler/icons-react';
import { Breadcrumb, Button, Separator, Card, Alert } from 'erxes-ui';
import { PageHeader } from 'ui-modules';

// Default template that will be used for all contracts
const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html lang="mn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Даатгалын гэрээ - {{contractNumber}}</title>
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
      background: white;
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
    
    .amount-value {
      font-size: 28pt;
      font-weight: bold;
      color: #2563eb;
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
    
    .signature-line {
      border-top: 1px solid #333;
      margin-top: 60px;
      padding-top: 10px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>ДААТГАЛЫН ГЭРЭЭ</h1>
    <div>Гэрээний дугаар: {{contractNumber}}</div>
  </div>

  <div class="section">
    <div class="section-title">Даатгалын компани</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Компанийн нэр</div>
        <div class="info-value">{{vendorName}}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Даатгуулагч</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Овог нэр</div>
        <div class="info-value">{{customerName}}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Регистрийн дугаар</div>
        <div class="info-value">{{registrationNumber}}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Даатгалын мэдээлэл</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Даатгалын төрөл</div>
        <div class="info-value">{{insuranceType}}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Бүтээгдэхүүн</div>
        <div class="info-value">{{productName}}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Эхлэх огноо</div>
        <div class="info-value">{{startDate}}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Дуусах огноо</div>
        <div class="info-value">{{endDate}}</div>
      </div>
    </div>
  </div>

  <div class="amount-box">
    <div>Нийт хураамж</div>
    <div class="amount-value">{{chargedAmount}} ₮</div>
  </div>

  <div class="footer">
    <div class="signature-section">
      <div>
        <div style="font-weight: bold; margin-bottom: 10px;">Даатгалын компани</div>
        <div class="signature-line">Гарын үсэг, тамга</div>
      </div>
      <div>
        <div style="font-weight: bold; margin-bottom: 10px;">Даатгуулагч</div>
        <div class="signature-line">Гарын үсэг</div>
      </div>
    </div>
  </div>
</body>
</html>`;

const TEMPLATE_STORAGE_KEY = 'insurance_contract_template';

export const ContractTemplateEditorPage = () => {
  const [template, setTemplate] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load template from localStorage on mount
  useEffect(() => {
    const savedTemplate = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    setTemplate(savedTemplate || DEFAULT_TEMPLATE);
  }, []);

  const handleSave = () => {
    localStorage.setItem(TEMPLATE_STORAGE_KEY, template);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (confirm('Анхны template руу буцаах уу? Таны өөрчлөлтүүд устана.')) {
      setTemplate(DEFAULT_TEMPLATE);
      localStorage.removeItem(TEMPLATE_STORAGE_KEY);
    }
  };

  const handlePreview = () => {
    const previewWindow = window.open('', '_blank');
    if (!previewWindow) {
      alert('Popup блоклогдсон байна. Popup зөвшөөрнө үү.');
      return;
    }

    // Replace placeholders with sample data for preview
    const previewHtml = template
      .replace(/\{\{contractNumber\}\}/g, 'INS2026010001')
      .replace(/\{\{vendorName\}\}/g, 'Монгол Даатгал ХХК')
      .replace(/\{\{customerName\}\}/g, 'Бат Болд')
      .replace(/\{\{registrationNumber\}\}/g, 'УБ12345678')
      .replace(/\{\{insuranceType\}\}/g, 'Автомашины даатгал')
      .replace(/\{\{productName\}\}/g, 'Стандарт даатгал')
      .replace(/\{\{startDate\}\}/g, '2026 оны 1-р сарын 20')
      .replace(/\{\{endDate\}\}/g, '2027 оны 1-р сарын 20')
      .replace(/\{\{chargedAmount\}\}/g, '1,500,000');

    previewWindow.document.write(previewHtml);
    previewWindow.document.close();
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Popup блоклогдсон байна. Popup зөвшөөрнө үү.');
      return;
    }

    const previewHtml = template
      .replace(/\{\{contractNumber\}\}/g, 'INS2026010001')
      .replace(/\{\{vendorName\}\}/g, 'Монгол Даатгал ХХК')
      .replace(/\{\{customerName\}\}/g, 'Бат Болд')
      .replace(/\{\{registrationNumber\}\}/g, 'УБ12345678')
      .replace(/\{\{insuranceType\}\}/g, 'Автомашины даатгал')
      .replace(/\{\{productName\}\}/g, 'Стандарт даатгал')
      .replace(/\{\{startDate\}\}/g, '2026 оны 1-р сарын 20')
      .replace(/\{\{endDate\}\}/g, '2027 оны 1-р сарын 20')
      .replace(/\{\{chargedAmount\}\}/g, '1,500,000');

    printWindow.document.write(previewHtml);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      setTimeout(() => {
        printWindow.close();
      }, 100);
    };
  };

  const handleDownload = () => {
    const blob = new Blob([template], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'contract_template.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost">
                  <IconFileText />
                  Contract Template Editor
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton />
        </PageHeader.Start>
        <PageHeader.End>
          <Button onClick={handleReset} variant="outline">
            Reset to Default
          </Button>
          <Button onClick={handlePreview} variant="outline">
            <IconEye size={16} />
            Preview
          </Button>
          <Button onClick={handlePrint} variant="outline">
            <IconPrinter size={16} />
            Print
          </Button>
          <Button onClick={handleDownload} variant="outline">
            <IconDownload size={16} />
            Download
          </Button>
          <Button onClick={handleSave}>
            <IconDeviceFloppy size={16} />
            Save Template
          </Button>
        </PageHeader.End>
      </PageHeader>

      <div className="flex h-full overflow-hidden">
        <div className="flex flex-col h-full overflow-auto flex-auto p-6">
          <div className="max-w-7xl mx-auto w-full">
            {saved && (
              <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
                ✅ Template амжилттай хадгалагдлаа! Бүх гэрээнд энэ template
                ашиглагдана.
              </Alert>
            )}

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <IconCode className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      Contract Template Editor
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Бүх гэрээнд ашиглагдах нэг template
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? 'default' : 'outline'}
                >
                  {isEditing ? 'View Mode' : 'Edit Mode'}
                </Button>
              </div>

              <div className="space-y-4">
                {isEditing ? (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      HTML Template
                    </label>
                    <textarea
                      value={template}
                      onChange={(e) => setTemplate(e.target.value)}
                      className="w-full h-[600px] p-4 font-mono text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      spellCheck={false}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      💡 Tip: Placeholders ашиглана:{' '}
                      {`{{contractNumber}}, {{vendorName}}, {{customerName}}, {{chargedAmount}}`}{' '}
                      гэх мэт
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Template Preview
                    </label>
                    <div className="border rounded-md p-4 bg-gray-50 overflow-auto max-h-[600px]">
                      <iframe
                        srcDoc={template
                          .replace(/\{\{contractNumber\}\}/g, 'INS2026010001')
                          .replace(/\{\{vendorName\}\}/g, 'Монгол Даатгал ХХК')
                          .replace(/\{\{customerName\}\}/g, 'Бат Болд')
                          .replace(/\{\{registrationNumber\}\}/g, 'УБ12345678')
                          .replace(
                            /\{\{insuranceType\}\}/g,
                            'Автомашины даатгал',
                          )
                          .replace(/\{\{productName\}\}/g, 'Стандарт даатгал')
                          .replace(
                            /\{\{startDate\}\}/g,
                            '2026 оны 1-р сарын 20',
                          )
                          .replace(/\{\{endDate\}\}/g, '2027 оны 1-р сарын 20')
                          .replace(/\{\{chargedAmount\}\}/g, '1,500,000')}
                        className="w-full h-[800px] bg-white border-0"
                        title="Template Preview"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">
                  📝 Placeholders:
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                  <div>
                    <code className="bg-blue-100 px-2 py-1 rounded">{`{{contractNumber}}`}</code>{' '}
                    - Гэрээний дугаар
                  </div>
                  <div>
                    <code className="bg-blue-100 px-2 py-1 rounded">{`{{vendorName}}`}</code>{' '}
                    - Компанийн нэр
                  </div>
                  <div>
                    <code className="bg-blue-100 px-2 py-1 rounded">{`{{customerName}}`}</code>{' '}
                    - Даатгуулагчийн нэр
                  </div>
                  <div>
                    <code className="bg-blue-100 px-2 py-1 rounded">{`{{registrationNumber}}`}</code>{' '}
                    - Регистр
                  </div>
                  <div>
                    <code className="bg-blue-100 px-2 py-1 rounded">{`{{insuranceType}}`}</code>{' '}
                    - Даатгалын төрөл
                  </div>
                  <div>
                    <code className="bg-blue-100 px-2 py-1 rounded">{`{{productName}}`}</code>{' '}
                    - Бүтээгдэхүүн
                  </div>
                  <div>
                    <code className="bg-blue-100 px-2 py-1 rounded">{`{{startDate}}`}</code>{' '}
                    - Эхлэх огноо
                  </div>
                  <div>
                    <code className="bg-blue-100 px-2 py-1 rounded">{`{{endDate}}`}</code>{' '}
                    - Дуусах огноо
                  </div>
                  <div>
                    <code className="bg-blue-100 px-2 py-1 rounded">{`{{chargedAmount}}`}</code>{' '}
                    - Төлбөрийн дүн
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
