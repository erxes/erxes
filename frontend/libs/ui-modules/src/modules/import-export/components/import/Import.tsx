import { IconDownload, IconUpload } from '@tabler/icons-react';
import { Button, Popover, cn } from 'erxes-ui';
import { useImportUploadHandler } from '../../hooks/import/useImportUploadHandler';
import { ImportProgress } from './ImportProgress';
import { Link } from 'react-router-dom';

export const Import = ({
  title = 'Upload CSV',
  pluginName,
  moduleName,
  collectionName,
  onFileUploaded,
}: {
  title?: string;
  pluginName: string;
  moduleName: string;
  collectionName: string;
  onFileUploaded?: (file: File) => void;
}) => {
  const {
    activeImports,
    isDragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    handleClickUpload,
    handleDownloadTemplate,
    isLoading,
  } = useImportUploadHandler(
    `${pluginName}:${moduleName}.${collectionName}`,
    onFileUploaded,
  );

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
          <ImportUploader
            {...{
              isDragOver,
              handleDragOver,
              handleDragLeave,
              handleDrop,
              handleFileSelect,
              handleClickUpload,
              handleDownloadTemplate,
              isLoading,
            }}
          />
          {activeImports.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Imports</p>
              {activeImports.map((importProgress: any) => (
                <ImportProgress
                  key={importProgress._id}
                  importProgress={importProgress}
                />
              ))}
            </div>
          )}
          <Button asChild variant="outline" className="w-full">
            <Link to="/import-export/import">See all imports</Link>
          </Button>
        </div>
      </Popover.Content>
    </Popover>
  );
};

const ImportUploader = ({
  isDragOver,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileSelect,
  handleClickUpload,
  handleDownloadTemplate,
  isLoading,
}: {
  isDragOver: boolean;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleClickUpload: () => void;
  handleDownloadTemplate: () => void;
  isLoading: boolean;
}) => {
  return (
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
          <span className="text-sm text-muted-foreground">Uploading...</span>
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
  );
};
