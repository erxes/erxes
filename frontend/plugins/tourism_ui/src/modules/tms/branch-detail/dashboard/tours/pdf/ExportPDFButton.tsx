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
import { Button, Dialog, Sheet, Spinner, useToast } from 'erxes-ui';
import { useBranchDetail } from '@/tms/hooks/BranchDetail';
import { useItineraryDetail } from '../../itinerary/hooks/useItineraryDetail';
import '../../itinerary/pdf/fonts';
import type { ITourDetail } from '../hooks/useTourDetail';
import { TourEditForm } from '../_components/TourEditForm';
import { generateFilename } from '../../itinerary/pdf/utils';
import { buildTourPdfBlob, resolveTourForPdf } from './pdfBuilder';

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
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string>();
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>();
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
  const canEdit = Boolean(localizedTour?._id);
  const canDownload = Boolean(previewBlob) && !previewLoading;
  const previewStatusText = previewLoading
    ? 'Preparing PDF preview...'
    : 'Preview refreshes automatically after edits.';

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

    if (shouldWaitForBranch || shouldWaitForItinerary) {
      return;
    }

    void generatePreview(forcePreviewRefreshRef.current).finally(() => {
      forcePreviewRefreshRef.current = false;
    });
  }, [
    generatePreview,
    localizedTour,
    previewOpen,
    refreshNonce,
    shouldWaitForBranch,
    shouldWaitForItinerary,
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
    </>
  );
};
