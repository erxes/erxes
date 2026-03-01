import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  IconFileText,
  IconEye,
  IconDownload,
  IconPrinter,
  IconCode,
  IconDeviceFloppy,
} from '@tabler/icons-react';
import { Breadcrumb, Button, Separator, Card, Skeleton } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { useContract } from '~/modules/insurance/hooks';
import { generateContractHTML } from '~/utils/contractPdfGenerator';
import { useMutation, gql } from '@apollo/client';

const SAVE_CONTRACT_PDF = gql`
  mutation SaveContractPDF($contractId: ID!, $pdfContent: String!) {
    saveContractPDF(contractId: $contractId, pdfContent: $pdfContent) {
      id
      pdfContent
    }
  }
`;

export const ContractPdfEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const { contract, loading } = useContract(id!);
  const [htmlContent, setHtmlContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saveContractPDF, { loading: saving }] = useMutation(SAVE_CONTRACT_PDF);

  // Load saved PDF content or generate from template when contract loads
  useEffect(() => {
    if (contract) {
      // Use saved PDF content if exists, otherwise generate from template
      if ((contract as any).pdfContent) {
        setHtmlContent((contract as any).pdfContent);
      } else {
        setHtmlContent(generateContractHTML(contract));
      }
    }
  }, [contract, id]);

  const handleSaveContractPDF = async () => {
    if (!id || !htmlContent) return;
    try {
      await saveContractPDF({
        variables: {
          contractId: id,
          pdfContent: htmlContent,
        },
      });
      alert('Contract PDF saved successfully!');
    } catch (error) {
      console.error('Error saving contract PDF:', error);
      alert('Error saving PDF');
    }
  };

  const handlePreview = () => {
    const previewWindow = window.open('', '_blank');
    if (!previewWindow) {
      alert('Popup blocked. Please allow popups.');
      return;
    }
    previewWindow.document.write(htmlContent);
    previewWindow.document.close();
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Popup blocked. Please allow popups.');
      return;
    }
    printWindow.document.write(htmlContent);
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
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contract_${contract?.contractNumber || 'template'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (contract) {
      setHtmlContent(generateContractHTML(contract));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full p-6">
        <div className="max-w-7xl mx-auto w-full">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
            <Skeleton className="h-[600px] w-full" />
          </Card>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Contract not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost">
                  <IconFileText />
                  Contract PDF Editor
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton />
        </PageHeader.Start>
        <PageHeader.End>
          <Button onClick={handleReset} variant="outline">
            Reset
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
            Download HTML
          </Button>
          <Button onClick={handleSaveContractPDF} disabled={saving}>
            <IconDeviceFloppy size={16} />
            {saving ? 'Saving...' : 'Save Contract PDF'}
          </Button>
        </PageHeader.End>
      </PageHeader>

      <div className="flex h-full overflow-hidden">
        <div className="flex flex-col h-full overflow-auto flex-auto p-6">
          <div className="max-w-7xl mx-auto w-full">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <IconCode className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">HTML Template Editor</h2>
                    <p className="text-sm text-muted-foreground">
                      Contract Number: {contract.contractNumber}
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
                      HTML Content
                    </label>
                    <textarea
                      value={htmlContent}
                      onChange={(e) => setHtmlContent(e.target.value)}
                      className="w-full h-[600px] p-4 font-mono text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      spellCheck={false}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      💡 Tip: You can edit HTML and CSS directly. Click Preview
                      to see the result.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      HTML Preview
                    </label>
                    <div className="border rounded-md p-4 bg-gray-50 overflow-auto max-h-[600px]">
                      <iframe
                        srcDoc={htmlContent}
                        className="w-full h-[800px] bg-white border-0"
                        title="PDF Preview"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">
                  📝 Instructions:
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>
                    • <strong>Edit Mode:</strong> Edit HTML template directly
                  </li>
                  <li>
                    • <strong>Preview:</strong> Opens in new window
                  </li>
                  <li>
                    • <strong>Print:</strong> Opens print dialog for PDF
                  </li>
                  <li>
                    • <strong>Download HTML:</strong> Downloads HTML file
                  </li>
                  <li>
                    • <strong>Reset:</strong> Reverts to original template
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
