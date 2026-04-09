import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  IconDownload,
  IconEdit,
  IconFileTypePdf,
  IconRefresh,
  IconX,
} from '@tabler/icons-react';
import { useAtomValue } from 'jotai';
import { Button, Dialog, Label, Select, Spinner, useToast } from 'erxes-ui';
import type { IItineraryDetail } from '../hooks/useItineraryDetail';
import { useItineraryPdfTemplate } from '../hooks/useItineraryPdfTemplate';
import { useBranchDetail } from '@/tms/hooks/BranchDetail';
import { activeLangAtom } from '@/tms/atoms/activeLangAtom';
import { ItineraryEditSheet } from '../_components/ItineraryEditSheet';
import {
  createTemplateFromItinerary,
  CustomTemplateEditorSheet,
  ensureTemplateHasDefaultDayCards,
} from './custom-template';
import { generateFilename } from './utils';
import { buildItineraryPdfBlob } from './pdfBuilder';
import { ITINERARY_PDF_TEMPLATES } from './templates';
import type { ItineraryPdfTemplate } from './types';
import type { PdfTemplateDocument } from './custom-template/template.types';
import './fonts';

interface ExportPDFButtonProps {
  itinerary?: IItineraryDetail | null;
  loading?: boolean;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  branchId?: string;
  branchLanguages?: string[];
  mainLanguage?: string;
  refetchItinerary?: () => Promise<unknown>;
}

export const ExportPDFButton: React.FC<ExportPDFButtonProps> = ({
  itinerary,
  loading: externalLoading,
  variant = 'outline',
  size = 'default',
  className,
  branchId: fallbackBranchId,
  branchLanguages,
  mainLanguage,
  refetchItinerary,
}) => {
  const activeLang = useAtomValue(activeLangAtom);
  const language = activeLang || mainLanguage;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [customTemplateOpen, setCustomTemplateOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string>();
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [selectedTemplate, setSelectedTemplate] =
    useState<ItineraryPdfTemplate>('classic');
  const [customTemplate, setCustomTemplate] =
    useState<PdfTemplateDocument | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const { toast } = useToast();
  const downloadTimeoutRef = useRef<NodeJS.Timeout>();
  const downloadObjectUrlRef = useRef<string>();
  const previewObjectUrlRef = useRef<string>();
  const previewRequestIdRef = useRef(0);
  const isMountedRef = useRef(true);
  const forcePreviewRefreshRef = useRef(false);
  const branchId = itinerary?.branchId || fallbackBranchId;
  const { branchDetail: rawBranchDetail, loading: branchLoading } =
    useBranchDetail({
      id: branchId,
    });
  const branchDetail = useMemo(
    () =>
      rawBranchDetail && rawBranchDetail._id === branchId
        ? rawBranchDetail
        : undefined,
    [branchId, rawBranchDetail],
  );
  const shouldWaitForBranch = Boolean(
    branchId && branchLoading && !branchDetail,
  );
  const shouldFetchCustomTemplate = Boolean(
    itinerary?._id && (selectedTemplate === 'custom' || customTemplateOpen),
  );
  const {
    template: persistedCustomTemplate,
    loading: customTemplateLoading,
    error: customTemplateError,
    refetch: refetchCustomTemplate,
  } = useItineraryPdfTemplate(
    itinerary?._id,
    shouldFetchCustomTemplate,
    'custom-builder',
  );
  const canEdit = Boolean(itinerary?._id);
  const canDownload = Boolean(previewBlob) && !previewLoading;
  const selectedTemplateOption = useMemo(
    () =>
      ITINERARY_PDF_TEMPLATES.find(
        (template) => template.value === selectedTemplate,
      ) || ITINERARY_PDF_TEMPLATES[0],
    [selectedTemplate],
  );
  const resolvedCustomTemplate = useMemo(() => {
    if (selectedTemplate !== 'custom' || !itinerary) {
      return undefined;
    }

    return ensureTemplateHasDefaultDayCards(
      customTemplate ||
        persistedCustomTemplate ||
        createTemplateFromItinerary({
          itinerary,
          branchId: branchId || itinerary.branchId || 'draft-branch',
          userId: 'server-user',
        }),
    );
  }, [
    branchId,
    customTemplate,
    itinerary,
    persistedCustomTemplate,
    selectedTemplate,
  ]);
  const shouldWaitForCustomTemplate = Boolean(
    selectedTemplate === 'custom' &&
      itinerary?._id &&
      customTemplateLoading &&
      !customTemplate &&
      !persistedCustomTemplate,
  );
  const previewStatusText = previewLoading
    ? 'Preparing PDF preview...'
    : selectedTemplate === 'custom' && customTemplateLoading
    ? 'Loading saved custom template...'
    : selectedTemplate === 'custom'
    ? 'Custom Builder selected. Saved layout loads from the server.'
    : `${selectedTemplateOption.label} selected. Refreshes after edits.`;

  const revokePreviewUrl = useCallback(() => {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = undefined;
    }
    setPreviewUrl(undefined);
  }, []);

  const resetPreviewState = useCallback(() => {
    previewRequestIdRef.current += 1;
    revokePreviewUrl();
    setPreviewBlob(null);
    setPreviewError(undefined);
    setPreviewLoading(false);
  }, [revokePreviewUrl]);

  const triggerDownload = useCallback((url: string, filename: string): void => {
    if (downloadTimeoutRef.current) {
      clearTimeout(downloadTimeoutRef.current);
    }

    downloadObjectUrlRef.current = url;

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    downloadTimeoutRef.current = setTimeout(() => {
      if (document.body.contains(link)) {
        link.remove();
      }

      URL.revokeObjectURL(url);
      downloadObjectUrlRef.current = undefined;
    }, 5000);
  }, []);

  const generatePreview = useCallback(
    async (force = false) => {
      if (!itinerary) {
        setPreviewError('No itinerary data available.');
        return;
      }

      if (
        selectedTemplate === 'custom' &&
        customTemplateError &&
        !customTemplate
      ) {
        setPreviewError('Failed to load the saved custom template.');
        return;
      }

      const requestId = ++previewRequestIdRef.current;
      setPreviewLoading(true);
      setPreviewError(undefined);

      try {
        const { blob, loadedImages, totalImages } = await buildItineraryPdfBlob(
          {
            itinerary,
            branchDetail,
            branchId,
            language,
            template: selectedTemplate,
            customTemplate: resolvedCustomTemplate,
            force,
          },
        );

        if (
          !isMountedRef.current ||
          requestId !== previewRequestIdRef.current
        ) {
          return;
        }

        if (totalImages > 0 && loadedImages < totalImages) {
          toast({
            title: 'Some images failed to load',
            description: `${
              totalImages - loadedImages
            } of ${totalImages} image(s) could not be loaded. The preview may have missing images.`,
          });
        }

        revokePreviewUrl();

        const nextPreviewUrl = URL.createObjectURL(blob);
        previewObjectUrlRef.current = nextPreviewUrl;
        setPreviewBlob(blob);
        setPreviewUrl(nextPreviewUrl);
      } catch (err) {
        if (
          !isMountedRef.current ||
          requestId !== previewRequestIdRef.current
        ) {
          return;
        }

        setPreviewBlob(null);
        setPreviewError(
          err instanceof Error ? err.message : 'Failed to generate preview.',
        );
      } finally {
        if (isMountedRef.current && requestId === previewRequestIdRef.current) {
          setPreviewLoading(false);
        }
      }
    },
    [
      branchDetail,
      branchId,
      itinerary,
      language,
      revokePreviewUrl,
      customTemplate,
      customTemplateError,
      selectedTemplate,
      resolvedCustomTemplate,
      toast,
    ],
  );

  const handleDownload = useCallback(() => {
    if (!previewBlob || !itinerary) {
      return;
    }

    const url = URL.createObjectURL(previewBlob);
    triggerDownload(url, generateFilename(itinerary.name));

    toast({
      title: 'PDF downloaded',
      description: `"${itinerary.name || 'Itinerary'}" has been downloaded.`,
      variant: 'success',
    });
  }, [itinerary, previewBlob, toast, triggerDownload]);

  const handlePreviewOpenChange = useCallback(
    (open: boolean) => {
      setPreviewOpen(open);

      if (!open) {
        resetPreviewState();
      }
    },
    [resetPreviewState],
  );

  const handleRefreshPreview = useCallback(() => {
    void generatePreview(true);
  }, [generatePreview]);

  const handleTemplateChange = useCallback((value: string) => {
    setSelectedTemplate(value as ItineraryPdfTemplate);
  }, []);

  const handleOpenEditSheet = useCallback(() => {
    if (selectedTemplate === 'custom') {
      setCustomTemplateOpen(true);
      return;
    }

    setEditOpen(true);
  }, [selectedTemplate]);

  const handleEditOpenChange = useCallback(
    async (open: boolean) => {
      setEditOpen(open);

      if (!open && itinerary?._id) {
        try {
          await refetchItinerary?.();
        } catch (error) {
          toast({
            title: 'Refresh failed',
            description:
              error instanceof Error
                ? error.message
                : 'Failed to reload itinerary details.',
            variant: 'destructive',
          });
        } finally {
          forcePreviewRefreshRef.current = true;
          setRefreshNonce((current) => current + 1);
        }
      }
    },
    [itinerary?._id, refetchItinerary, toast],
  );

  const handleCustomTemplateSave = useCallback(
    (template: PdfTemplateDocument) => {
      setCustomTemplate(template);
      void refetchCustomTemplate();
      forcePreviewRefreshRef.current = true;
      setRefreshNonce((current) => current + 1);
    },
    [refetchCustomTemplate],
  );

  useEffect(() => {
    setCustomTemplate(null);
  }, [itinerary?._id]);

  useEffect(() => {
    if (!previewOpen || !itinerary) {
      return;
    }

    if (shouldWaitForBranch || shouldWaitForCustomTemplate) {
      return;
    }

    void generatePreview(forcePreviewRefreshRef.current).finally(() => {
      forcePreviewRefreshRef.current = false;
    });
  }, [
    generatePreview,
    itinerary,
    previewOpen,
    refreshNonce,
    selectedTemplate,
    shouldWaitForBranch,
    shouldWaitForCustomTemplate,
  ]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      previewRequestIdRef.current += 1;

      if (downloadTimeoutRef.current) {
        clearTimeout(downloadTimeoutRef.current);
      }

      if (downloadObjectUrlRef.current) {
        URL.revokeObjectURL(downloadObjectUrlRef.current);
      }

      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
      }
    };
  }, []);

  const isDisabled = !itinerary || externalLoading;

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled={isDisabled}
        onClick={() => handlePreviewOpenChange(true)}
      >
        <IconFileTypePdf size={16} />
        {size !== 'icon' && 'Preview PDF'}
      </Button>

      <Dialog open={previewOpen} onOpenChange={handlePreviewOpenChange}>
        <Dialog.Content className="max-w-[96vw] h-[92vh] grid-rows-[auto_minmax(0,1fr)_auto] p-0 gap-0 overflow-hidden">
          <Dialog.Close asChild>
            <Button
              variant="secondary"
              size="icon"
              className="absolute z-10 right-4 top-4"
            >
              <IconX size={16} />
            </Button>
          </Dialog.Close>

          <Dialog.Header className="px-6 py-4 space-y-1 border-b pr-14">
            <Dialog.Title>Itinerary PDF preview</Dialog.Title>
            <Dialog.Description>
              Preview before download. You can edit and refresh here.
            </Dialog.Description>
            <div className="pt-2 space-y-2">
              <Label htmlFor="template-select">Template</Label>
              <Select
                value={selectedTemplate}
                onValueChange={handleTemplateChange}
              >
                <Select.Trigger className="h-9 min-w-20" id="template-select">
                  <Select.Value>{selectedTemplateOption.label}</Select.Value>
                </Select.Trigger>
                <Select.Content>
                  {ITINERARY_PDF_TEMPLATES.map((template) => (
                    <Select.Item key={template.value} value={template.value}>
                      <div className="flex flex-col">
                        <span>{template.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {template.description}
                        </span>
                      </div>
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
          </Dialog.Header>

          <div className="flex-1 min-h-0 bg-muted/30">
            {previewLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Spinner />
                  Preparing PDF preview...
                </div>
              </div>
            ) : previewError ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
                <p className="max-w-md text-sm text-muted-foreground">
                  {previewError}
                </p>
                <Button variant="outline" onClick={handleRefreshPreview}>
                  <IconRefresh size={16} />
                  Retry preview
                </Button>
              </div>
            ) : previewUrl ? (
              <iframe
                title="Itinerary PDF preview"
                src={previewUrl}
                className="w-full h-full bg-white border-0"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                No preview available yet.
              </div>
            )}
          </div>

          <Dialog.Footer className="px-6 py-4 border-t sm:justify-between sm:space-x-0">
            <p className="text-xs text-muted-foreground">{previewStatusText}</p>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
              <Button
                variant="outline"
                onClick={handleRefreshPreview}
                disabled={previewLoading || !itinerary}
              >
                {previewLoading ? <Spinner /> : <IconRefresh size={16} />}
                Refresh
              </Button>

              <Button
                variant="outline"
                onClick={handleOpenEditSheet}
                disabled={!canEdit}
              >
                <IconEdit size={16} />
                {selectedTemplate === 'custom'
                  ? 'Edit template'
                  : 'Edit itinerary'}
              </Button>

              <Button onClick={handleDownload} disabled={!canDownload}>
                <IconDownload size={16} />
                Download PDF
              </Button>
            </div>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>

      <ItineraryEditSheet
        itineraryId={itinerary?._id}
        branchId={branchId}
        branchLanguages={branchLanguages}
        mainLanguage={mainLanguage}
        open={editOpen}
        onOpenChange={(open) => {
          void handleEditOpenChange(open);
        }}
      />

      {itinerary?._id ? (
        <CustomTemplateEditorSheet
          open={customTemplateOpen}
          onOpenChange={setCustomTemplateOpen}
          itinerary={{
            ...itinerary,
          }}
          branch={
            branchDetail
              ? {
                  name: branchDetail.name,
                  mainLogoBase64: undefined,
                }
              : undefined
          }
          onSave={handleCustomTemplateSave}
        />
      ) : null}
    </>
  );
};
