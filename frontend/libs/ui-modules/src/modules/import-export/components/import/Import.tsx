import { useState, useCallback } from 'react';
import {
  Button,
  Popover,
  cn,
  useUpload,
  REACT_APP_API_URL,
  useToast,
} from 'erxes-ui';
import { IconDownload, IconUpload } from '@tabler/icons-react';
import { useImport } from '../../hooks/import/useImport';
import { ImportProgress } from './ImportProgress';

interface ImportProps {
  title?: string;
  entityType?: string;
  onFileUploaded?: (file: File) => void;
}

export const Import = ({
  title = 'Upload CSV',
  entityType,
  onFileUploaded,
}: ImportProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const { isLoading, upload } = useUpload();
  const { activeImports, startImport } = useImport();
  const { toast } = useToast();

  const relevantImports = entityType
    ? activeImports.filter((imp: any) => imp.entityType === entityType)
    : activeImports;

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
    }
  }, []);

  return (
    <Popover>
      <Popover.Trigger>
        <Button variant="outline">
          <IconDownload className="size-4" />
          Import
        </Button>
      </Popover.Trigger>
      <Popover.Content className="p-6 w-96">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">
              Only .csv files are supported
            </p>
          </div>

          {relevantImports.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Active Imports</p>
              {relevantImports.map((importProgress: any) => (
                <ImportProgress
                  key={importProgress._id}
                  importProgress={importProgress}
                />
              ))}
            </div>
          )}
          <div
            className={cn(
              'w-full rounded-lg flex flex-col gap-3 items-center justify-center border-2 border-dashed transition-colors duration-200 p-8',
              isDragOver
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50',
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload-input"
              accept=".csv"
            />
            {isLoading ? (
              <div className="flex flex-col gap-2 items-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Uploading...
                </span>
              </div>
            ) : (
              <>
                <IconUpload className="w-12 h-12 text-muted-foreground" />
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleClickUpload}
                  type="button"
                >
                  <IconUpload className="size-4" />
                  Upload
                </Button>
              </>
            )}
            <Button
              variant="secondary"
              onClick={handleDownloadTemplate}
              type="button"
            >
              <IconDownload className="size-4" />
              Download Template
            </Button>
          </div>
        </div>
      </Popover.Content>
    </Popover>
  );
};
