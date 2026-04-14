import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  IconAdjustmentsHorizontal,
  IconDownload,
  IconEdit,
  IconFileTypePdf,
  IconRefresh,
  IconX,
} from '@tabler/icons-react';
import { useQuery } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { Button, Dialog, Label, Select, Spinner, useToast } from 'erxes-ui';
import type { IItineraryDetail } from '../hooks/useItineraryDetail';
import { useBranchDetail } from '@/tms/hooks/BranchDetail';
import { activeLangAtom } from '@/tms/atoms/activeLangAtom';
import { ItineraryEditSheet } from '../_components/ItineraryEditSheet';
import { CustomizePdfDialog } from './CustomizePdfDialog';
import { generateFilename } from './utils';
import { buildItineraryPdfBlob } from './pdfBuilder';
import { ITINERARY_PDF_TEMPLATES } from './templates';
import {
  DEFAULT_ITINERARY_PDF_LABELS,
  type ItineraryPdfLabels,
  type ItineraryPdfRenderConfig,
  type ItineraryPdfTemplate,
} from './types';
import { GET_ELEMENTS } from '@/tms/branch-detail/dashboard/elements/graphql/queries';
import type { IElement } from '@/tms/branch-detail/dashboard/elements/types/element';
import { GET_AMENITIES } from '@/tms/branch-detail/dashboard/amenities/graphql/queries';
import type { IAmenity } from '@/tms/branch-detail/dashboard/amenities/types/amenity';
import './fonts';

const DEFAULT_PDF_CONFIG: ItineraryPdfRenderConfig = {
  showCoverPage: true,
  showFooterPage: true,
  showDayContent: true,
  showElements: false,
  showAmenities: false,
  labels: DEFAULT_ITINERARY_PDF_LABELS,
};

const createDefaultPdfConfig = (): ItineraryPdfRenderConfig => ({
  ...DEFAULT_PDF_CONFIG,
  labels: { ...DEFAULT_PDF_CONFIG.labels },
});

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
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string>();
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [selectedTemplate, setSelectedTemplate] =
    useState<ItineraryPdfTemplate>('classic');
  const [pdfConfig, setPdfConfig] = useState<ItineraryPdfRenderConfig>(
    createDefaultPdfConfig,
  );
  const [customizeOpen, setCustomizeOpen] = useState(false);
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
  const { data: elementsData, loading: elementsLoading } = useQuery<{
    bmsElements: {
      list: IElement[];
      totalCount: number;
    };
  }>(GET_ELEMENTS, {
    variables: {
      branchId,
      language,
      quick: false,
      limit: 100,
      orderBy: { createdAt: -1 },
    },
    skip: !branchId || !previewOpen || !pdfConfig.showElements,
    fetchPolicy: 'cache-and-network',
  });
  const elements = useMemo(
    () => elementsData?.bmsElements?.list ?? [],
    [elementsData?.bmsElements?.list],
  );
  const pdfElements = useMemo(
    () =>
      elements.map((element) => ({
        _id: element._id,
        name: element.name,
        note: element.note,
        content: element.content,
        startTime: element.startTime,
        duration: element.duration,
        cost: element.cost,
      })),
    [elements],
  );
  const { data: amenitiesData, loading: amenitiesLoading } = useQuery<{
    bmsElements: {
      list: IAmenity[];
      totalCount: number;
    };
  }>(GET_AMENITIES, {
    variables: {
      branchId,
      language,
      quick: true,
      limit: 100,
      orderBy: { createdAt: -1 },
    },
    skip: !branchId || !previewOpen || !pdfConfig.showAmenities,
    fetchPolicy: 'cache-and-network',
  });
  const amenities = useMemo(
    () => amenitiesData?.bmsElements?.list ?? [],
    [amenitiesData?.bmsElements?.list],
  );
  const pdfAmenities = useMemo(
    () =>
      amenities.map((amenity) => ({
        _id: amenity._id,
        name: amenity.name,
        icon: amenity.icon,
      })),
    [amenities],
  );
  const shouldWaitForElements = Boolean(
    pdfConfig.showElements &&
      previewOpen &&
      branchId &&
      elementsLoading &&
      !elements.length,
  );
  const shouldWaitForAmenities = Boolean(
    pdfConfig.showAmenities &&
      previewOpen &&
      branchId &&
      amenitiesLoading &&
      !amenities.length,
  );
  const shouldWaitForResources =
    shouldWaitForElements || shouldWaitForAmenities;

  const canEdit = Boolean(itinerary?._id);
  const canDownload =
    Boolean(previewBlob) && !previewLoading && !shouldWaitForResources;
  const selectedTemplateOption = useMemo(
    () =>
      ITINERARY_PDF_TEMPLATES.find(
        (template) => template.value === selectedTemplate,
      ) || ITINERARY_PDF_TEMPLATES[0],
    [selectedTemplate],
  );

  const previewStatusText =
    previewLoading || shouldWaitForResources
      ? 'Preparing PDF preview...'
      : 'Preview refreshes automatically after edits and customization changes.';

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
            config: pdfConfig,
            elements: pdfElements,
            amenities: pdfAmenities,
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
      pdfAmenities,
      pdfElements,
      pdfConfig,
      revokePreviewUrl,
      selectedTemplate,
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

  const handleConfigToggle = useCallback(
    (
      key: keyof ItineraryPdfRenderConfig,
      checked: boolean | 'indeterminate',
    ) => {
      const nextChecked = checked === true;

      setPdfConfig((current) => {
        if (key === 'showCoverPage') {
          return {
            ...current,
            showCoverPage: nextChecked,
          };
        }

        if (key === 'showFooterPage') {
          return {
            ...current,
            showFooterPage: nextChecked,
          };
        }

        if (key === 'showAmenities') {
          return {
            ...current,
            showAmenities: nextChecked,
          };
        }

        if (key === 'showDayContent') {
          if (!nextChecked && !current.showElements) {
            return current;
          }

          return {
            ...current,
            showDayContent: nextChecked,
            showElements: nextChecked ? false : current.showElements,
          };
        }

        if (key === 'showElements') {
          if (!nextChecked && !current.showDayContent) {
            return current;
          }

          return {
            ...current,
            showElements: nextChecked,
            showDayContent: nextChecked ? false : current.showDayContent,
          };
        }

        return current;
      });
    },
    [],
  );

  const handleLabelChange = useCallback(
    (key: keyof ItineraryPdfLabels, value: string) => {
      setPdfConfig((current) => ({
        ...current,
        labels: {
          ...current.labels,
          [key]: value,
        },
      }));
    },
    [],
  );

  const handleResetCustomize = useCallback(() => {
    setPdfConfig(createDefaultPdfConfig());
  }, []);

  const handleOpenEditSheet = useCallback(() => {
    setEditOpen(true);
  }, []);

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

  useEffect(() => {
    if (!previewOpen || !itinerary) {
      return;
    }

    if (shouldWaitForBranch) {
      return;
    }

    if (shouldWaitForResources) {
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
    pdfConfig,
    selectedTemplate,
    shouldWaitForBranch,
    shouldWaitForResources,
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
            {previewLoading || shouldWaitForResources ? (
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
                onClick={() => setCustomizeOpen(true)}
                disabled={!itinerary}
              >
                <IconAdjustmentsHorizontal size={16} />
                Customize
              </Button>

              <Button
                variant="outline"
                onClick={handleRefreshPreview}
                disabled={
                  previewLoading || shouldWaitForResources || !itinerary
                }
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
                Edit itinerary
              </Button>

              <Button onClick={handleDownload} disabled={!canDownload}>
                <IconDownload size={16} />
                Download PDF
              </Button>
            </div>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>

      <CustomizePdfDialog
        open={customizeOpen}
        onOpenChange={setCustomizeOpen}
        pdfConfig={pdfConfig}
        onConfigToggle={handleConfigToggle}
        onLabelChange={handleLabelChange}
        onReset={handleResetCustomize}
      />

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
    </>
  );
};
