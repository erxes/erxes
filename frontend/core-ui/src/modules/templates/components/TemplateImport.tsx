import { IconDownload } from '@tabler/icons-react';
import { Button, REACT_APP_API_URL, toast } from 'erxes-ui';
import { useState } from 'react';

export const TemplateImport = () => {
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
          title: 'Success',
          description: 'Template imported successfully!',
          variant: 'success',
        });
      } else {
        toast({
          title: 'Import failed',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Import failed',
        description: 'Failed to import template. Please check the file format.',
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
          {importing ? 'Importing...' : 'Import'}
        </label>
      </Button>
    </div>
  );
};
