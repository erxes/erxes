import {
  IconArrowRight,
  IconDownload,
  IconFileSpreadsheet,
  IconHistory,
  IconUpload,
} from '@tabler/icons-react';
import { Button, Popover, ScrollArea, Sheet, cn } from 'erxes-ui';
import { Badge } from 'erxes-ui/components/badge';
import {
  forwardRef,
  useEffect,
  useState,
  type ComponentPropsWithoutRef,
  type ComponentType,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ImportColumnMappingSheet } from './ImportColumnMappingSheet';
import { ImportFieldReference } from './ImportFieldReference';
import { ImportProgress } from './ImportProgress';
import { ImportProvider, useImport } from './ImportProvider';

export const Import = ({
  title = 'Upload CSV',
  pluginName,
  moduleName,
  collectionName,
  onFileUploaded,
  children,
}: {
  title?: string;
  pluginName: string;
  moduleName: string;
  collectionName: string;
  onFileUploaded?: (file: File) => void;
  children?: ReactNode;
}) => {
  return (
    <ImportProvider
      {...{ pluginName, moduleName, collectionName, title, onFileUploaded }}
    >
      <Popover>
        <Popover.Trigger asChild>
          <ImportPopoverTrigger />
        </Popover.Trigger>
        <Popover.Content
          align="end"
          className="min-h-48 max-h-[var(--radix-popover-content-available-height)] w-92 max-w-[calc(100vw-1rem)] overflow-hidden p-0"
        >
          {/* Radix wraps the viewport's children in a `display: table` div,
              which sizes to content — the override lets the popover width win
              so long file names and copy can truncate instead of overflowing. */}
          <ScrollArea
            className="h-full"
            viewportClassName="[&>div]:block! [&>div]:min-w-0"
          >
            <ImportPopoverInfo>{children}</ImportPopoverInfo>
            <div className="grid grid-cols-2 gap-2 px-5 py-4">
              <ImportSectionSheet />

              <ImportHistoryButton />
            </div>
            <ActiveImportsSection />
          </ScrollArea>
        </Popover.Content>
      </Popover>

      <ImportColumnMappingSheet />
    </ImportProvider>
  );
};

const ImportPopoverInfo = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation('importExport');
  const { resolvedTitle, entityPluralLabel } = useImport();

  return (
    <div className="border-b bg-muted/30 px-5 py-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0 rounded-xl bg-primary/10 p-2.5 text-primary">
          <IconFileSpreadsheet className="size-5" />
        </div>
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold">{resolvedTitle}</h3>
            <Badge variant="info">{t('csv-only')}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('popover-description', { entity: entityPluralLabel })}
          </p>
          {children}
        </div>
      </div>
    </div>
  );
};

const ImportPopoverTrigger = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof Button>
>(({ className, ...props }, ref) => {
  const { t } = useTranslation('importExport');
  const { activeImports } = useImport();

  return (
    <Button
      ref={ref}
      variant="outline"
      className={cn('gap-2', className)}
      {...props}
    >
      <IconUpload className="size-4" />
      {t('import')}
      {activeImports.length > 0 && (
        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-xs text-primary">
          {activeImports.length}
        </span>
      )}
    </Button>
  );
});

ImportPopoverTrigger.displayName = 'ImportPopoverTrigger';

const ImportHistoryButton = () => {
  const { t } = useTranslation('importExport');
  const { contentType } = useImport();
  return (
    <Button asChild variant="outline" className="w-full justify-between">
      <Link to={`/settings/import-export/import?type=${contentType}`}>
        {t('history')}
        <IconArrowRight className="size-4" />
      </Link>
    </Button>
  );
};

const ImportSectionSheet = () => {
  const { t } = useTranslation('importExport');
  const { resolvedTitle, entityPluralLabel, contentType, pendingUpload } =
    useImport();
  const [open, setOpen] = useState(false);

  // The upload sheet has done its job once a file is parked for mapping.
  useEffect(() => {
    if (pendingUpload) {
      setOpen(false);
    }
  }, [pendingUpload]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button className="w-full">{t('import-now')}</Button>
      </Sheet.Trigger>
      <Sheet.View className="flex w-full flex-col sm:w-[440px]">
        <Sheet.Header>
          <Sheet.Title>{resolvedTitle}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        {/* The intro and the drop zone keep their size; the field reference
            takes whatever height is left and scrolls inside itself. */}
        <Sheet.Content className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
          <div className="shrink-0 space-y-5 p-4">
            <Button
              asChild
              variant="outline"
              className="w-full justify-between"
            >
              <Link to={`/settings/import-export/import?type=${contentType}`}>
                {t('open-import-history')}
                <IconArrowRight className="size-4" />
              </Link>
            </Button>

            <div className="rounded-xl border bg-muted/20 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t('how-it-works')}
              </p>
              <div className="mt-2 divide-y">
                <StepRow
                  icon={IconDownload}
                  title={t('step-download-title')}
                  description={t('step-download-description', {
                    entity: entityPluralLabel,
                  })}
                />
                <StepRow
                  icon={IconFileSpreadsheet}
                  title={t('step-fill-title', { entity: entityPluralLabel })}
                  description={t('step-fill-description')}
                />
                <StepRow
                  icon={IconUpload}
                  title={t('step-upload-title')}
                  description={t('step-upload-description')}
                />
              </div>
            </div>

            <ImportUploader />
          </div>

          <ImportFieldReference />
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};

const ActiveImportsSection = () => {
  const { t } = useTranslation('importExport');
  const { activeImports } = useImport();
  return (
    <div className="space-y-5 p-5">
      {activeImports.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">{t('current-imports')}</p>
              <p className="text-xs text-muted-foreground">
                {t('current-imports-description')}
              </p>
            </div>
            <Badge variant="secondary">{activeImports.length}</Badge>
          </div>
          <div className="max-h-92 space-y-2 overflow-y-auto pr-1">
            {activeImports.map((importProgress: any) => (
              <ImportProgress
                key={importProgress._id}
                importProgress={importProgress}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border bg-muted/20 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-background p-2 shadow-sm">
              <IconHistory className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">{t('no-imports-running')}</p>
              <p className="text-xs text-muted-foreground">
                {t('no-imports-running-description')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ImportUploader = () => {
  const { t } = useTranslation('importExport');
  const {
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
  } = useImport();
  return (
    <div
      className={cn(
        'w-full rounded-xl border-2 border-dashed bg-muted/10 p-4 transition-colors duration-200',
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
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="rounded-full bg-background p-2.5 shadow-sm">
          <IconUpload className="size-5 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">{t('drop-csv')}</p>
          <p className="text-xs text-muted-foreground">
            {t('drop-csv-description', { entity: entityLabel })}
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">
              {t('uploading-csv')}
            </span>
          </div>
        ) : (
          <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
            <Button
              className="w-full"
              onClick={() => handleClickUpload(inputId)}
              type="button"
            >
              <IconUpload className="size-4" />
              {t('choose-csv')}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleDownloadTemplate}
              type="button"
            >
              <IconDownload className="size-4" />
              {t('download-template')}
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
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) => {
  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <div className="rounded-full bg-background p-1.5 shadow-sm">
        <Icon className="size-4 text-primary" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};
