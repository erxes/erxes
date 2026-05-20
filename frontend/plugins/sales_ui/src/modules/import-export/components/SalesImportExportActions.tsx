import {
  IconArrowRight,
  IconDownload,
  IconFileSpreadsheet,
  IconHelpCircle,
  IconHistory,
  IconUpload,
} from '@tabler/icons-react';
import { VariantProps } from 'class-variance-authority';
import {
  ActiveExportsPopover,
  ExportFieldSelection,
  ImportProgress,
  useExport,
  useImport,
} from 'ui-modules';
import {
  Button,
  Dialog,
  Popover,
  REACT_APP_API_URL,
  ScrollArea,
  Sheet,
  buttonVariants,
  cn,
  toast,
  useUpload,
} from 'erxes-ui';
import { Badge } from 'erxes-ui/components/badge';
import {
  type ChangeEvent,
  type ComponentType,
  type DragEvent,
  type ReactNode,
  useCallback,
  useId,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

type ImportExportContentType = {
  pluginName: string;
  moduleName: string;
  collectionName: string;
};

const getContentType = ({
  pluginName,
  moduleName,
  collectionName,
}: ImportExportContentType) => `${pluginName}:${moduleName}.${collectionName}`;

const useSalesImportUploadHandler = (
  entityType?: string,
  onFileUploaded?: (file: File) => void,
) => {
  const { t } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);
  const { isLoading, upload } = useUpload();
  const { activeImports, startImport } = useImport(entityType);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileUpload = useCallback(
    (files: FileList) => {
      if (!files?.length) {
        return;
      }

      if (files.length !== 1) {
        toast({
          title: t('sales.importExport.uploadOneFileAtATime', {
            defaultValue: 'Upload one file at a time',
          }),
          description: t('sales.importExport.selectSingleCsvFile', {
            defaultValue: 'Please select a single CSV file to import',
          }),
          variant: 'destructive',
        });
        return;
      }

      const file = files[0];

      if (!file.name.toLowerCase().endsWith('.csv')) {
        toast({
          title: t('sales.importExport.invalidFileType', {
            defaultValue: 'Invalid file type',
          }),
          description: t('sales.importExport.csvOnlyDescription', {
            defaultValue: 'Only .csv files are supported',
          }),
          variant: 'destructive',
        });
        return;
      }

      if (!entityType) {
        toast({
          title: t('sales.importExport.missingEntityType', {
            defaultValue: 'Missing entity type',
          }),
          description: t('sales.importExport.entityTypeRequiredToImport', {
            defaultValue: 'Entity type is required to start import',
          }),
          variant: 'destructive',
        });
        return;
      }

      upload({
        files,
        kind: 'import',
        afterUpload: async ({ response }) => {
          onFileUploaded?.(file);

          if (!response) {
            toast({
              title: t('sales.importExport.uploadFailed', {
                defaultValue: 'Upload failed',
              }),
              description: t('sales.importExport.noFileKeyReturned', {
                defaultValue:
                  'File upload completed but no file key was returned',
              }),
              variant: 'destructive',
            });
            return;
          }

          const fileKey =
            typeof response === 'string' ? response : String(response);

          if (!fileKey.trim()) {
            toast({
              title: t('sales.importExport.invalidFileKey', {
                defaultValue: 'Invalid file key',
              }),
              description: t('sales.importExport.invalidFileKeyDescription', {
                defaultValue: 'File upload completed but file key is invalid',
              }),
              variant: 'destructive',
            });
            return;
          }

          try {
            await startImport(entityType, fileKey, file.name);
            toast({
              title: t('sales.importExport.importStarted', {
                defaultValue: 'Import started',
              }),
              description: t('sales.importExport.importStartedForFile', {
                defaultValue:
                  'Import process has been started for {{fileName}}',
                fileName: file.name,
              }),
            });
          } catch (error: any) {
            toast({
              title: t('sales.importExport.failedToStartImport', {
                defaultValue: 'Failed to start import',
              }),
              description:
                error?.message ||
                t('sales.importExport.failedToStartImportDescription', {
                  defaultValue: 'An error occurred while starting the import',
                }),
              variant: 'destructive',
            });
          }
        },
      });
    },
    [entityType, onFileUploaded, startImport, t, upload],
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFileUpload(e.dataTransfer.files);
    },
    [handleFileUpload],
  );

  const handleFileSelect = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        handleFileUpload(e.target.files);
      }

      e.target.value = '';
    },
    [handleFileUpload],
  );

  const handleClickUpload = useCallback((inputId = 'csv-upload-input') => {
    const input = document.getElementById(inputId) as HTMLInputElement | null;
    input?.click();
  }, []);

  const handleDownloadTemplate = useCallback(async () => {
    if (!entityType) {
      toast({
        title: t('sales.importExport.missingEntityType', {
          defaultValue: 'Missing entity type',
        }),
        description: t('sales.importExport.entityTypeRequiredToDownload', {
          defaultValue: 'Entity type is required to download template',
        }),
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(
        `${REACT_APP_API_URL}/import-export/download-template?entityType=${encodeURIComponent(
          entityType,
        )}`,
        {
          method: 'GET',
          credentials: 'include',
        },
      );

      if (!response.ok) {
        throw new Error(
          t('sales.importExport.failedToDownloadTemplate', {
            defaultValue: 'Failed to download template',
          }),
        );
      }

      const disposition = response.headers.get('content-disposition') || '';
      const filename =
        disposition.match(/filename="(.+?)"/)?.[1] || 'import-template.csv';
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      let anchor: HTMLAnchorElement | null = null;

      try {
        anchor = document.createElement('a');
        anchor.href = blobUrl;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
      } finally {
        window.URL.revokeObjectURL(blobUrl);
        anchor?.remove();
      }
    } catch (error: any) {
      toast({
        title: t('sales.importExport.failedToDownloadTemplate', {
          defaultValue: 'Failed to download template',
        }),
        description:
          error?.message ||
          t('sales.importExport.failedToDownloadTemplateDescription', {
            defaultValue: 'An error occurred while downloading the template',
          }),
        variant: 'destructive',
      });
    }
  }, [entityType, t]);

  return {
    activeImports,
    isDragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    handleClickUpload,
    handleDownloadTemplate,
    isLoading,
  };
};

export const SalesImport = ({
  title,
  singularLabel,
  pluralLabel,
  pluginName,
  moduleName,
  collectionName,
  onFileUploaded,
  additionContent,
  helperTriggerLabel,
  helperDescription,
}: ImportExportContentType & {
  title: string;
  singularLabel: string;
  pluralLabel: string;
  onFileUploaded?: (file: File) => void;
  additionContent?: () => ReactNode;
  helperTriggerLabel?: string;
  helperDescription?: string;
}) => {
  const { t } = useTranslation();
  const inputId = useId();
  const contentType = getContentType({
    pluginName,
    moduleName,
    collectionName,
  });
  const resolvedHelperTriggerLabel =
    helperTriggerLabel ??
    t('sales.importExport.viewImportGuide', {
      defaultValue: 'View import guide',
    });
  const resolvedHelperDescription =
    helperDescription ??
    t('sales.importExport.importGuideDescription', {
      defaultValue: 'Import guide and field reference',
    });
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
  } = useSalesImportUploadHandler(contentType, onFileUploaded);

  const renderAdditionInfo = () => {
    if (!additionContent) {
      return null;
    }

    return (
      <Dialog>
        <Dialog.Trigger asChild>
          <Button
            variant="secondary"
            className="mt-1 w-full justify-start gap-2 border border-primary/30 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
          >
            <IconHelpCircle className="size-4" />
            {resolvedHelperTriggerLabel}
          </Button>
        </Dialog.Trigger>
        <Dialog.ContentCombined
          title={title}
          description={resolvedHelperDescription}
          className="w-[min(1100px,90vw)] max-w-[min(1100px,90vw)] sm:max-w-[min(1100px,90vw)] h-[85vh] overflow-hidden grid-rows-[auto_1fr]"
        >
          <ScrollArea className="h-full mx-6 px-6 pb-2">
            <div className="pt-2 text-sm leading-relaxed">
              {additionContent()}
            </div>
          </ScrollArea>
        </Dialog.ContentCombined>
      </Dialog>
    );
  };

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button variant="outline" className="gap-2">
          <IconUpload className="size-4" />
          {t('sales.importExport.import', { defaultValue: 'Import' })}
          {activeImports.length > 0 && (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-xs text-primary">
              {activeImports.length}
            </span>
          )}
        </Button>
      </Popover.Trigger>
      <Popover.Content
        align="end"
        className="h-[85dvh] max-h-[var(--radix-popover-content-available-height)] w-92 max-w-[calc(100vw-1rem)] overflow-hidden p-0"
      >
        <ScrollArea className="h-full">
          <div className="border-b bg-muted/30 px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                <IconFileSpreadsheet className="size-5" />
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold">{title}</h3>
                  <Badge variant="info">
                    {t('sales.importExport.csvOnly', {
                      defaultValue: 'CSV only',
                    })}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('sales.importExport.importDescription', {
                    defaultValue:
                      'Download the template, add your {{pluralLabel}}, then upload the file to create or update {{pluralLabel}} in bulk.',
                    pluralLabel,
                  })}
                </p>
                {renderAdditionInfo()}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 px-5 py-4">
            <Sheet>
              <Sheet.Trigger asChild>
                <Button className="w-full">
                  {t('sales.importExport.importNow', {
                    defaultValue: 'Import now',
                  })}
                </Button>
              </Sheet.Trigger>
              <Sheet.View className="flex h-[85dvh] max-h-[85dvh] w-full flex-col sm:w-[440px]">
                <Sheet.Header>
                  <Sheet.Title>{title}</Sheet.Title>
                  <Sheet.Close />
                </Sheet.Header>
                <Sheet.Content className="min-h-0 flex-1 p-4">
                  <ScrollArea className="h-full">
                    <div className="space-y-5">
                      <div className="rounded-xl border bg-muted/20 px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {t('sales.importExport.howItWorks', {
                            defaultValue: 'How it works',
                          })}
                        </p>
                        <div className="mt-2 divide-y">
                          <StepRow
                            icon={IconDownload}
                            title={t('sales.importExport.downloadCsvTemplate', {
                              defaultValue: 'Download the CSV template',
                            })}
                            description={t(
                              'sales.importExport.downloadCsvTemplateDescription',
                              {
                                defaultValue:
                                  'Start with the template so your {{pluralLabel}} columns match the importer.',
                                pluralLabel,
                              },
                            )}
                          />
                          <StepRow
                            icon={IconFileSpreadsheet}
                            title={t('sales.importExport.addPluralLabel', {
                              defaultValue: 'Add your {{pluralLabel}}',
                              pluralLabel,
                            })}
                            description={t(
                              'sales.importExport.addPluralLabelDescription',
                              {
                                defaultValue:
                                  'Fill in each row with the values you want to create or update.',
                              },
                            )}
                          />
                          <StepRow
                            icon={IconUpload}
                            title={t('sales.importExport.uploadCompletedFile', {
                              defaultValue: 'Upload the completed file',
                            })}
                            description={t(
                              'sales.importExport.uploadCompletedFileDescription',
                              {
                                defaultValue:
                                  'We will validate the file and begin the import right away.',
                              },
                            )}
                          />
                        </div>
                      </div>

                      <ImportUploader
                        inputId={inputId}
                        entityLabel={singularLabel}
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

                      <Button
                        asChild
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <Link
                          to={`/settings/import-export/import?type=${contentType}`}
                        >
                          {t('sales.importExport.openImportHistory', {
                            defaultValue: 'Open import history',
                          })}
                          <IconArrowRight className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </ScrollArea>
                </Sheet.Content>
              </Sheet.View>
            </Sheet>

            <Button
              asChild
              variant="outline"
              className="w-full justify-between"
            >
              <Link to={`/settings/import-export/import?type=${contentType}`}>
                {t('sales.importExport.history', { defaultValue: 'History' })}
                <IconArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="space-y-5 p-5">
            {activeImports.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">
                      {t('sales.importExport.currentImports', {
                        defaultValue: 'Current imports',
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('sales.importExport.currentImportsDescription', {
                        defaultValue:
                          'Check progress, retry failed jobs, or download error rows.',
                      })}
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
                    <p className="text-sm font-medium">
                      {t('sales.importExport.noImportsRunning', {
                        defaultValue: 'No imports running',
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('sales.importExport.noImportsRunningDescription', {
                        defaultValue:
                          'Your latest CSV uploads will appear here so you can follow progress and fix any row-level errors.',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </Popover.Content>
    </Popover>
  );
};

export const SalesExport = ({
  pluginName,
  moduleName,
  collectionName,
  entityDisplayName,
  buttonVariant = 'outline',
  ids,
  getFilters,
  confirmMessage,
}: ImportExportContentType & {
  entityDisplayName: string;
  buttonVariant?: VariantProps<typeof buttonVariants>['variant'];
  ids?: string[];
  getFilters?: () => Record<string, any>;
  confirmMessage?: string;
}) => {
  const { t } = useTranslation();
  const [fieldSelectionOpen, setFieldSelectionOpen] = useState(false);
  const entityType = getContentType({ pluginName, moduleName, collectionName });
  const resolvedConfirmMessage =
    confirmMessage ??
    t('sales.importExport.confirmExport', {
      defaultValue: 'Create this CSV export with the selected fields?',
    });
  const { loading, onFieldSelectionConfirm } = useExport({
    entityType,
    ids,
    getFilters,
    confirmMessage: resolvedConfirmMessage,
  });

  return (
    <>
      <div className="flex items-center">
        <Button
          variant={buttonVariant}
          disabled={loading}
          onClick={() => setFieldSelectionOpen(true)}
          className="border-r-0 rounded-r-none"
        >
          <IconDownload />
          {t('sales.importExport.export', { defaultValue: 'Export' })}
        </Button>
        <ActiveExportsPopover
          buttonVariant={buttonVariant}
          entityType={entityType}
          entityDisplayName={entityDisplayName}
          selectionCount={ids?.length}
          onStartExport={() => setFieldSelectionOpen(true)}
        />
      </div>

      <ExportFieldSelection
        entityType={entityType}
        open={fieldSelectionOpen}
        onOpenChange={setFieldSelectionOpen}
        onConfirm={onFieldSelectionConfirm}
        recordCount={ids?.length}
        entityDisplayName={entityDisplayName}
      />
    </>
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
  handleDragOver: (e: DragEvent) => void;
  handleDragLeave: (e: DragEvent) => void;
  handleDrop: (e: DragEvent) => void;
  handleFileSelect: (e: ChangeEvent<HTMLInputElement>) => void;
  handleClickUpload: (inputId?: string) => void;
  handleDownloadTemplate: () => void;
  isLoading: boolean;
}) => {
  const { t } = useTranslation();

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
          <p className="text-sm font-medium">
            {t('sales.importExport.dropCsvOrChooseFile', {
              defaultValue: 'Drop your CSV here or choose a file',
            })}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('sales.importExport.uploadEntityInBulk', {
              defaultValue:
                'Upload one file at a time to import {{entityLabel}} data in bulk.',
              entityLabel,
            })}
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">
              {t('sales.importExport.uploadingCsv', {
                defaultValue: 'Uploading your CSV...',
              })}
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
              {t('sales.importExport.chooseCsvFile', {
                defaultValue: 'Choose CSV file',
              })}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleDownloadTemplate}
              type="button"
            >
              <IconDownload className="size-4" />
              {t('sales.importExport.downloadTemplate', {
                defaultValue: 'Download template',
              })}
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
