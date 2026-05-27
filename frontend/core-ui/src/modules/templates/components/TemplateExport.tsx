import { Template } from '@/templates/types/Template';
import { IconFileDownload } from '@tabler/icons-react';
import { Command, REACT_APP_API_URL, toast } from 'erxes-ui';
import { useState } from 'react';

export const TemplateExport = ({ template }: { template: Template }) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);

    const exportUrl = `${REACT_APP_API_URL}/export/template/${template._id}`;

    fetch(exportUrl, { credentials: 'include' })
      .then((response) => {
        if (response.ok) {
          window.open(exportUrl, '_blank');
        } else if (response.status === 401) {
          toast({
            title: 'Authentication required',
            description:
              'Please login to export templates. Redirecting to login...',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Export failed',
            description: 'Failed to export template. Please try again.',
            variant: 'destructive',
          });
        }
      })
      .catch((error) => {
        console.error('Export error:', error);
        toast({
          title: 'Export failed',
          description: 'Failed to export template. Please try again.',
          variant: 'destructive',
        });
      })
      .finally(() => {
        setExporting(false);
      });
  };

  return (
    <Command.Item value="export" onSelect={handleExport} disabled={exporting}>
      <IconFileDownload className="w-4 h-4" />
      {exporting ? 'Exporting...' : 'Export'}
    </Command.Item>
  );
};
