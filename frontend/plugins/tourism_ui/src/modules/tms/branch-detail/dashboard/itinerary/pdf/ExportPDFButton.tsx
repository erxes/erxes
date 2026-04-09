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
import { Button, Dialog, Spinner, useToast } from 'erxes-ui';
import type { IItineraryDetail } from '../hooks/useItineraryDetail';
import { useBranchDetail } from '@/tms/hooks/BranchDetail';
import { activeLangAtom } from '@/tms/atoms/activeLangAtom';
import { ItineraryEditSheet } from '../_components/ItineraryEditSheet';
import { generateFilename } from './utils';
import { buildItineraryPdfBlob } from './pdfBuilder';
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
  const canEdit = Boolean(itinerary?._id);
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
    [branchDetail, branchId, itinerary, language, revokePreviewUrl, toast],
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

    void generatePreview(forcePreviewRefreshRef.current).finally(() => {
      forcePreviewRefreshRef.current = false;
    });
  }, [
    generatePreview,
    itinerary,
    previewOpen,
    refreshNonce,
    shouldWaitForBranch,
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
              className="absolute right-4 top-4 z-10"
            >
              <IconX size={16} />
            </Button>
          </Dialog.Close>

          <Dialog.Header className="border-b px-6 py-4 pr-14 space-y-1">
            <Dialog.Title>Itinerary PDF preview</Dialog.Title>
            <Dialog.Description>
              Review the generated PDF before downloading it. You can also open
              the itinerary editor from here and refresh the preview.
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
                title="Itinerary PDF preview"
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
