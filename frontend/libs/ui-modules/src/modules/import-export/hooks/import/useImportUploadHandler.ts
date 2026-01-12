import { REACT_APP_API_URL, toast, useUpload } from 'erxes-ui';
import { useCallback, useState } from 'react';
import { useImport } from './useImport';
export const useImportUploadHandler = (
  entityType?: string,
  onFileUploaded?: (file: File) => void,
) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const { isLoading, upload } = useUpload();
  const { activeImports, startImport } = useImport(entityType);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileUpload = useCallback(
    (files: FileList) => {
      if (!files || files.length === 0) return;

      const file = files[0];
      if (!file.name.endsWith('.csv')) {
        toast({
          title: 'Invalid file type',
          description: 'Only .csv files are supported',
          variant: 'destructive',
        });
        return;
      }

      if (!entityType) {
        toast({
          title: 'Missing entity type',
          description: 'Entity type is required to start import',
          variant: 'destructive',
        });
        return;
      }

      upload({
        files,
        afterUpload: async ({ fileInfo, response }) => {
          onFileUploaded?.(file);

          if (!response) {
            toast({
              title: 'Upload failed',
              description: 'File upload completed but no file key was returned',
              variant: 'destructive',
            });
            return;
          }

          // Ensure response is a string (fileKey)
          const fileKey =
            typeof response === 'string' ? response : String(response);

          if (!fileKey || fileKey.trim() === '') {
            toast({
              title: 'Invalid file key',
              description: 'File upload completed but file key is invalid',
              variant: 'destructive',
            });
            return;
          }

          try {
            await startImport(entityType, fileKey, file.name);
            toast({
              title: 'Import started',
              description: `Import process has been started for ${file.name}`,
            });
          } catch (error: any) {
            toast({
              title: 'Failed to start import',
              description:
                error?.message || 'An error occurred while starting the import',
              variant: 'destructive',
            });
          }
        },
      });
    },
    [upload, onFileUploaded, entityType, startImport, toast],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFileUpload(e.dataTransfer.files);
    },
    [handleFileUpload],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (fileList && fileList.length > 0) {
        handleFileUpload(fileList);
      }
      e.target.value = '';
    },
    [handleFileUpload],
  );

  const handleClickUpload = useCallback(() => {
    const input = document.getElementById(
      'csv-upload-input',
    ) as HTMLInputElement;
    if (input) {
      input.click();
    }
  }, []);

  const handleDownloadTemplate = useCallback(async () => {
    try {
      const response = await fetch(`${REACT_APP_API_URL}/download-template`, {
        method: 'GET',
        credentials: 'include',
        body: JSON.stringify({ entityType }),
      });

      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'import-template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      // Error handling can be added here if needed
      toast({
        title: 'Failed to download template',
        description: 'An error occurred while downloading the template',
        variant: 'destructive',
      });
    }
  }, []);

  return {
    isDragOver,
    handleDragOver,
    handleDragLeave,
    handleFileUpload,
    handleDrop,
    handleFileSelect,
    handleClickUpload,
    handleDownloadTemplate,
    isLoading,
    activeImports,
  };
};
