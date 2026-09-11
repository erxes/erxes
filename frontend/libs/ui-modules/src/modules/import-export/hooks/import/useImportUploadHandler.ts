import { REACT_APP_API_URL, toast, useUpload } from 'erxes-ui';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TPendingImportUpload } from '../../types/import/importTypes';
import { useImport } from './useImport';

export const useImportUploadHandler = (
  entityType?: string,
  onFileUploaded?: (file: File) => void,
) => {
  const { t } = useTranslation('importExport');
  const [isDragOver, setIsDragOver] = useState(false);
  const [pendingUpload, setPendingUpload] =
    useState<TPendingImportUpload | null>(null);
  const { isLoading, upload } = useUpload();
  const { activeImports } = useImport(entityType);

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
          title: t('invalid-file-type'),
          description: t('invalid-file-type-description'),
          variant: 'destructive',
        });
        return;
      }

      if (!entityType) {
        toast({
          title: t('missing-entity-type'),
          description: t('missing-entity-type-import'),
          variant: 'destructive',
        });
        return;
      }

      upload({
        files,
        kind: 'import',
        afterUpload: async ({ fileInfo, response }) => {
          onFileUploaded?.(file);

          if (!response) {
            toast({
              title: t('upload-failed'),
              description: t('upload-failed-description'),
              variant: 'destructive',
            });
            return;
          }

          // Ensure response is a string (fileKey)
          const fileKey =
            typeof response === 'string' ? response : String(response);

          if (!fileKey || fileKey.trim() === '') {
            toast({
              title: t('invalid-file-key'),
              description: t('invalid-file-key-description'),
              variant: 'destructive',
            });
            return;
          }

          // The upload only parks the file; nothing is written until the
          // column mapping is confirmed.
          setPendingUpload({ fileKey, fileName: file.name });
        },
      });
    },
    [upload, onFileUploaded, entityType, t],
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

  const handleClickUpload = useCallback((inputId = 'csv-upload-input') => {
    const input = document.getElementById(inputId) as HTMLInputElement;

    if (input) {
      input.click();
    }
  }, []);

  const handleDownloadTemplate = useCallback(async () => {
    if (!entityType) {
      toast({
        title: t('missing-entity-type'),
        description: t('missing-entity-type-template'),
        variant: 'destructive',
      });
      return;
    }

    try {
      const encodedEntityType = encodeURIComponent(entityType);

      const response = await fetch(
        `${REACT_APP_API_URL}/import-export/download-template?entityType=${encodedEntityType}`,
        {
          method: 'GET',
          credentials: 'include',
        },
      );

      if (!response.ok) {
        throw new Error(t('template-download-failed'));
      }

      const disposition = response.headers.get('content-disposition') || '';
      const match = disposition.match(/filename="(.+?)"/);
      const filename = match?.[1] || 'import-template.csv';

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (e: any) {
      toast({
        title: t('template-download-failed'),
        description: e?.message || t('template-download-failed'),
        variant: 'destructive',
      });
    }
  }, [entityType, t]);

  const clearPendingUpload = useCallback(() => setPendingUpload(null), []);

  return {
    pendingUpload,
    clearPendingUpload,
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
