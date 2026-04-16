import {
  IconArrowRight,
  IconDownload,
  IconFileSpreadsheet,
  IconHistory,
  IconUpload,
} from '@tabler/icons-react';
import { type ComponentType, useId } from 'react';
import { Link } from 'react-router-dom';
import { Button, Popover, ScrollArea, cn } from 'erxes-ui';
import { Badge } from 'erxes-ui/components/badge';
import { useImportUploadHandler } from '../../hooks/import/useImportUploadHandler';
import { formatEntityLabel } from '../../utils/entityLabel';
import { ImportProgress } from './ImportProgress';

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
  const inputId = useId();
  const contentType = `${pluginName}:${moduleName}.${collectionName}`;
  const entityLabel = formatEntityLabel(collectionName);
  const entityPluralLabel = formatEntityLabel(collectionName, { plural: true });
  const resolvedTitle =
    title === 'Upload CSV'
      ? `Import ${formatEntityLabel(collectionName, {
        plural: true,
        capitalize: true,
      })}`
      : title;
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
  } = useImportUploadHandler(contentType, onFileUploaded);

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button variant="outline" className="gap-2">
          <IconUpload className="size-4" />
          Import
          {activeImports.length > 0 && (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-xs text-primary">
              {activeImports.length}
            </span>
          )}
        </Button>
      </Popover.Trigger>
      <Popover.Content
        align="end"
        className="grid h-[85dvh] max-h-(--radix-popover-content-available-height) w-[420px] max-w-[calc(100vw-1rem)] grid-rows-[auto_minmax(0,1fr)] overflow-hidden p-0"
      >
        <div className="border-b bg-muted/30 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
              <IconFileSpreadsheet className="size-5" />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold">{resolvedTitle}</h3>
                <Badge variant="info">CSV only</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Download the template, add your {entityPluralLabel}, then upload
                the file to create or update {entityPluralLabel} in bulk.
              </p>
            </div>
          </div>
        </div>
        <ScrollArea className="min-h-0">
          <div className="space-y-5 p-5">
            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                How it works
              </p>
              <div className="mt-3 space-y-3">
                <StepRow
                  icon={IconDownload}
                  title="Download the CSV template"
                  description={`Start with the template so your ${entityPluralLabel} columns match the importer.`}
                />
                <StepRow
                  icon={IconFileSpreadsheet}
                  title={`Add your ${entityPluralLabel}`}
                  description="Fill in each row with the values you want to create or update."
                />
                <StepRow
                  icon={IconUpload}
                  title="Upload the completed file"
                  description="We will validate the file and begin the import right away."
                  isLast
                />
              </div>
            </div>

            <ImportUploader
              inputId={inputId}
              entityLabel={entityLabel}
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

            {activeImports.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Current imports</p>
                    <p className="text-xs text-muted-foreground">
                      Check progress, retry failed jobs, or download error rows.
                    </p>
                  </div>
                  <Badge variant="secondary">{activeImports.length}</Badge>
                </div>
                {activeImports.map((importProgress: any) => (
                  <ImportProgress
                    key={importProgress._id}
                    importProgress={importProgress}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border bg-muted/20 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-background p-2 shadow-sm">
                    <IconHistory className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">No imports running</p>
                    <p className="text-xs text-muted-foreground">
                      Your latest CSV uploads will appear here so you can follow
                      progress and fix any row-level errors.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button asChild variant="outline" className="w-full justify-between">
              <Link to={`/settings/import-export/import?type=${contentType}`}>
                Open import history
                <IconArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </ScrollArea>
      </Popover.Content>
    </Popover>
  );
};

const ImportUploader = ({
  inputId,
  entityLabel,
  isDragOver,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileSelect,
  handleClickUpload,
  handleDownloadTemplate,
  isLoading,
}: {
  inputId: string;
  entityLabel: string;
  isDragOver: boolean;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleClickUpload: (inputId?: string) => void;
  handleDownloadTemplate: () => void;
  isLoading: boolean;
}) => {
  return (
    <div
      className={cn(
        'w-full rounded-xl border-2 border-dashed p-5 transition-colors duration-200',
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
        id={inputId}
        accept=".csv"
      />
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-background p-3 shadow-sm">
          <IconUpload className="size-6 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">
            Drop your CSV here or choose a file
          </p>
          <p className="text-xs text-muted-foreground">
            Upload one file at a time to import {entityLabel} data in bulk.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">
              Uploading your CSV...
            </span>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button
              className="w-full"
              onClick={() => handleClickUpload(inputId)}
              type="button"
            >
              <IconUpload className="size-4" />
              Choose CSV file
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleDownloadTemplate}
              type="button"
            >
              <IconDownload className="size-4" />
              Download template
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const StepRow = ({
  icon: Icon,
  title,
  description,
  isLast = false,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  isLast?: boolean;
}) => {
  return (
    <div className={cn('flex items-start gap-3', !isLast && 'pb-3')}>
      <div className="rounded-full bg-background p-2 shadow-sm">
        <Icon className="size-4 text-primary" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};
