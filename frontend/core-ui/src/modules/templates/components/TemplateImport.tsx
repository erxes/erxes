import { IconDownload } from '@tabler/icons-react';
import { Button, REACT_APP_API_URL, toast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const TemplateImport = () => {
  const { t } = useTranslation('templates');
  const [importing, setImporting] = useState(false);

  const handleImport = async (file: File) => {
    setImporting(true);

    try {
      const text = await file.text();

      const response = await fetch(`${REACT_APP_API_URL}/import/template`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          encryptedData: text,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: t('success', 'Success'),
          description: t('messages.import-success', 'Template imported successfully!'),
          variant: 'success',
        });
      } else {
        toast({
          title: t('import-failed-title', 'Import failed'),
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: t('import-failed-title', 'Import failed'),
        description: t('messages.import-error', 'Failed to import template. Please check the file format.'),
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImport(file);
  };

  return (
    <div>
      <input
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        className="hidden"
        id="template-file-upload"
      />

      <Button disabled={importing} variant="outline" asChild>
        <label htmlFor="template-file-upload">
          <IconDownload />
          {importing ? t('importing', 'Importing...') : t('import', 'Import')}
        </label>
      </Button>
    </div>
  );
};
