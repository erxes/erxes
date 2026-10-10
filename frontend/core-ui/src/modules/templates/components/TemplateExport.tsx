import { Template } from '@/templates/types/Template';
import { IconFileDownload } from '@tabler/icons-react';
import { Command, REACT_APP_API_URL, toast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const TemplateExport = ({ template }: { template: Template }) => {
  const { t } = useTranslation('templates', { keyPrefix: 'template' });
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
            title: t('auth-required'),
            description: t('auth-required-description'),
            variant: 'destructive',
          });
        } else {
          toast({
            title: t('export-failed'),
            description: t('export-failed-description'),
            variant: 'destructive',
          });
        }
      })
      .catch((error) => {
        console.error('Export error:', error);
        toast({
          title: t('export-failed'),
          description: t('export-failed-description'),
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
      {exporting ? t('exporting') : t('export')}
    </Command.Item>
  );
};
