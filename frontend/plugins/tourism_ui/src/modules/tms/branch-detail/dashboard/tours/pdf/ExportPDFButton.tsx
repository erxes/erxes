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
import { Button, Dialog, Sheet, Spinner, useToast } from 'erxes-ui';
import { useBranchDetail } from '@/tms/hooks/BranchDetail';
import { useItineraryDetail } from '../../itinerary/hooks/useItineraryDetail';
import '../../itinerary/pdf/fonts';
import type { ItineraryPdfLabels } from '../../itinerary/pdf/types';
import { GET_AMENITIES } from '@/tms/branch-detail/dashboard/amenities/graphql/queries';
import type { IAmenity } from '@/tms/branch-detail/dashboard/amenities/types/amenity';
import { GET_ELEMENTS } from '@/tms/branch-detail/dashboard/elements/graphql/queries';
import type { IElement } from '@/tms/branch-detail/dashboard/elements/types/element';
import type { ITourDetail } from '../hooks/useTourDetail';
import { TourEditForm } from '../_components/TourEditForm';
import { generateFilename } from '../../itinerary/pdf/utils';
import { buildTourPdfBlob, resolveTourForPdf } from './pdfBuilder';
import { CustomizeTourPdfDialog } from './CustomizeTourPdfDialog';
import type { TourPdfLabels, TourPdfRenderConfig } from './types';
import { createDefaultTourPdfConfig } from './types';

interface ExportTourPDFButtonProps {
  tour?: ITourDetail | null;
  language?: string;
  loading?: boolean;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  branchId?: string;
  branchLanguages?: string[];
  mainLanguage?: string;
  refetchTour?: () => Promise<unknown>;
}

export const ExportTourPDFButton: React.FC<ExportTourPDFButtonProps> = ({
  tour,
  language,
  loading: externalLoading,
  variant = 'outline',
  size = 'default',
  className,
  branchId: fallbackBranchId,
  branchLanguages,
  mainLanguage,
  refetchTour,
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string>();
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [pdfConfig, setPdfConfig] = useState<TourPdfRenderConfig>(
    createDefaultTourPdfConfig,
  );
  const [refreshNonce, setRefreshNonce] = useState(0);
  const { toast } = useToast();
  const downloadTimeoutRef = useRef<NodeJS.Timeout>();
  const downloadObjectUrlRef = useRef<string>();
  const previewObjectUrlRef = useRef<string>();
  const previewRequestIdRef = useRef(0);
  const isMountedRef = useRef(true);
  const forcePreviewRefreshRef = useRef(false);
  const localizedTour = useMemo(
    () => (tour ? resolveTourForPdf(tour, language) : undefined),
    [language, tour],
  );
  const branchId = localizedTour?.branchId || fallbackBranchId;
  const itineraryId = localizedTour?.itineraryId;
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
  const {
    itinerary: rawItinerary,
    loading: itineraryLoading,
    refetch,
  } = useItineraryDetail(itineraryId, Boolean(itineraryId), language);
  const itinerary = useMemo(
    () =>
      rawItinerary && rawItinerary._id === itineraryId
        ? rawItinerary
        : undefined,
    [itineraryId, rawItinerary],
  );
  const shouldWaitForBranch = Boolean(
    branchId && branchLoading && !branchDetail,
  );
  const shouldWaitForItinerary = Boolean(
    itineraryId && itineraryLoading && !itinerary,
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
    skip: !branchId || !previewOpen || !pdfConfig.itineraryConfig.showElements,
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
    skip: !branchId || !previewOpen || !pdfConfig.itineraryConfig.showAmenities,
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
    pdfConfig.itineraryConfig.showElements &&
      previewOpen &&
      branchId &&
      elementsLoading &&
      !elements.length,
  );
  const shouldWaitForAmenities = Boolean(
    pdfConfig.itineraryConfig.showAmenities &&
      previewOpen &&
      branchId &&
      amenitiesLoading &&
      !amenities.length,
  );
  const shouldWaitForResources =
    shouldWaitForElements || shouldWaitForAmenities;
  const canEdit = Boolean(localizedTour?._id);
  const canDownload =
    Boolean(previewBlob) && !previewLoading && !shouldWaitForResources;
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
      if (!localizedTour) {
        setPreviewError('No tour data available.');
        return;
      }

      const requestId = ++previewRequestIdRef.current;
      setPreviewLoading(true);
      setPreviewError(undefined);

      try {
        const { blob, loadedImages, totalImages } = await buildTourPdfBlob({
          tour: localizedTour,
          itinerary,
          branchDetail,
          branchId,
          language,
          config: pdfConfig,
          elements: pdfElements,
          amenities: pdfAmenities,
          force,
        });

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
      } catch (error) {
        if (
          !isMountedRef.current ||
          requestId !== previewRequestIdRef.current
        ) {
          return;
        }

        setPreviewBlob(null);
        setPreviewError(
          error instanceof Error
            ? error.message
            : 'Failed to generate preview.',
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
      localizedTour,
      pdfAmenities,
      pdfElements,
      pdfConfig,
      revokePreviewUrl,
      toast,
    ],
  );

  const handleDownload = useCallback(() => {
    if (!previewBlob || !localizedTour) {
      return;
    }

    const url = URL.createObjectURL(previewBlob);
    triggerDownload(url, generateFilename(localizedTour.name));

    toast({
      title: 'PDF downloaded',
      description: `"${localizedTour.name || 'Tour'}" has been downloaded.`,
      variant: 'success',
    });
  }, [localizedTour, previewBlob, toast, triggerDownload]);

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

  const handleOpenEditSheet = useCallback(() => {
    setEditOpen(true);
  }, []);

  const handleConfigToggle = useCallback(
    (
      key: 'showCoverPage' | 'showDetailsPage' | 'showItineraryPage',
      checked: boolean | 'indeterminate',
    ) => {
      const nextChecked = checked === true;

      setPdfConfig((current) => {
        const nextConfig = {
          ...current,
          [key]: nextChecked,
        };

        if (
          !nextConfig.showCoverPage &&
          !nextConfig.showDetailsPage &&
          !nextConfig.showItineraryPage
        ) {
          return current;
        }

        return nextConfig;
      });
    },
    [],
  );

  const handleLabelChange = useCallback(
    (key: keyof TourPdfLabels, value: string) => {
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

  const handleItineraryConfigToggle = useCallback(
    (
      key: 'showDayContent' | 'showElements' | 'showAmenities',
      checked: boolean | 'indeterminate',
    ) => {
      const nextChecked = checked === true;

      setPdfConfig((current) => {
        const nextItineraryConfig = {
          ...current.itineraryConfig,
        };

        if (key === 'showAmenities') {
          nextItineraryConfig.showAmenities = nextChecked;
        }

        if (key === 'showDayContent') {
          if (!nextChecked && !current.itineraryConfig.showElements) {
            return current;
          }

          nextItineraryConfig.showDayContent = nextChecked;
          if (nextChecked) {
            nextItineraryConfig.showElements = false;
          }
        }

        if (key === 'showElements') {
          if (!nextChecked && !current.itineraryConfig.showDayContent) {
            return current;
          }

          nextItineraryConfig.showElements = nextChecked;
          if (nextChecked) {
            nextItineraryConfig.showDayContent = false;
          }
        }

        return {
          ...current,
          itineraryConfig: nextItineraryConfig,
        };
      });
    },
    [],
  );

  const handleItineraryLabelChange = useCallback(
    (key: keyof ItineraryPdfLabels, value: string) => {
      setPdfConfig((current) => ({
        ...current,
        itineraryConfig: {
          ...current.itineraryConfig,
          labels: {
            ...current.itineraryConfig.labels,
            [key]: value,
          },
        },
      }));
    },
    [],
  );

  const handleResetConfig = useCallback(() => {
    setPdfConfig(createDefaultTourPdfConfig());
  }, []);

  const handleEditOpenChange = useCallback(
    async (open: boolean) => {
      setEditOpen(open);

      if (!open && localizedTour?._id) {
        try {
          await Promise.all([
            refetchTour?.(),
            itineraryId ? refetch?.() : undefined,
          ]);
        } catch (error) {
          toast({
            title: 'Refresh failed',
            description:
              error instanceof Error
                ? error.message
                : 'Failed to reload tour details.',
            variant: 'destructive',
          });
        } finally {
          forcePreviewRefreshRef.current = true;
          setRefreshNonce((current) => current + 1);
        }
      }
    },
    [itineraryId, localizedTour?._id, refetch, refetchTour, toast],
  );

  useEffect(() => {
    if (!previewOpen || !localizedTour) {
      return;
    }

    if (
      shouldWaitForBranch ||
      shouldWaitForItinerary ||
      shouldWaitForResources
    ) {
      return;
    }

    void generatePreview(forcePreviewRefreshRef.current).finally(() => {
      forcePreviewRefreshRef.current = false;
    });
  }, [
    generatePreview,
    localizedTour,
    previewOpen,
    pdfConfig,
    refreshNonce,
    shouldWaitForBranch,
    shouldWaitForItinerary,
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

  const isDisabled = !localizedTour || externalLoading;

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
              className="absolute right-4 top-4 z-10"
            >
              <IconX size={16} />
            </Button>
          </Dialog.Close>

          <Dialog.Header className="border-b px-6 py-4 pr-14 space-y-1">
            <Dialog.Title>Tour PDF preview</Dialog.Title>
            <Dialog.Description>
              Review the generated PDF before downloading it. You can also open
              the tour editor from here and refresh the preview.
            </Dialog.Description>
          </Dialog.Header>

          <div className="flex-1 min-h-0 bg-muted/30">
            {previewLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Spinner />
                  Preparing PDF preview...
                </div>
              </div>
            ) : previewError ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
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
                title="Tour PDF preview"
                src={previewUrl}
                className="h-full w-full border-0 bg-white"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No preview available yet.
              </div>
            )}
          </div>

          <Dialog.Footer className="border-t px-6 py-4 sm:justify-between sm:space-x-0">
            <p className="text-xs text-muted-foreground">{previewStatusText}</p>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
              <Button
                variant="outline"
                onClick={() => setCustomizeOpen(true)}
                disabled={!localizedTour}
              >
                <IconAdjustmentsHorizontal size={16} />
                Customize
              </Button>

              <Button
                variant="outline"
                onClick={handleRefreshPreview}
                disabled={previewLoading || !localizedTour}
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
                Edit tour
              </Button>

              <Button onClick={handleDownload} disabled={!canDownload}>
                <IconDownload size={16} />
                Download PDF
              </Button>
            </div>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>

      <Sheet
        open={editOpen}
        onOpenChange={(open) => void handleEditOpenChange(open)}
      >
        <Sheet.View className="w-[900px] sm:max-w-[900px] p-0">
          {localizedTour?._id ? (
            <TourEditForm
              tourId={localizedTour._id}
              branchId={branchId}
              branchLanguages={branchLanguages}
              mainLanguage={mainLanguage}
              onSuccess={() => void handleEditOpenChange(false)}
            />
          ) : null}
        </Sheet.View>
      </Sheet>

      <CustomizeTourPdfDialog
        open={customizeOpen}
        onOpenChange={setCustomizeOpen}
        pdfConfig={pdfConfig}
        onConfigToggle={handleConfigToggle}
        onLabelChange={handleLabelChange}
        onItineraryConfigToggle={handleItineraryConfigToggle}
        onItineraryLabelChange={handleItineraryLabelChange}
        onReset={handleResetConfig}
      />
    </>
  );
};
