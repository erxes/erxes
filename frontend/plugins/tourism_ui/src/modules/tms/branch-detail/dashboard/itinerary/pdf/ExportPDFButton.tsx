import React, { useCallback, useEffect, useRef, useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { IconFileTypePdf } from '@tabler/icons-react';
import { Button, Spinner, useToast } from 'erxes-ui';
import type { IItineraryDetail } from '../hooks/useItineraryDetail';
import { ItineraryPDF } from './ItineraryPDF';
import { generateFilename, convertImagesToBase64 } from './utils';
import { useBranchDetail } from '@/tms/hooks/BranchDetail';
import './fonts';

/**
 * Module-level blob cache: key = `${itinerary._id}:${modifiedAt}:${branchId}`.
 * Skips full PDF regeneration when the same data is exported again.
 */
const pdfBlobCache = new Map<string, Blob>();
const MAX_PDF_CACHE_SIZE = 50;

function setCachedPdf(key: string, blob: Blob) {
  if (pdfBlobCache.size >= MAX_PDF_CACHE_SIZE) {
    const firstKey = pdfBlobCache.keys().next().value;
    if (firstKey) pdfBlobCache.delete(firstKey);
  }
  pdfBlobCache.set(key, blob);
}

interface ExportPDFButtonProps {
  itinerary?: IItineraryDetail | null;
  loading?: boolean;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const ExportPDFButton: React.FC<ExportPDFButtonProps> = ({
  itinerary,
  loading: externalLoading,
  variant = 'outline',
  size = 'default',
  className,
}) => {
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();
  const downloadTimeoutRef = useRef<NodeJS.Timeout>();
  const lastObjectUrlRef = useRef<string>();

  const triggerDownload = useCallback((url: string, filename: string): void => {
    lastObjectUrlRef.current = url;
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
      lastObjectUrlRef.current = undefined;
    }, 5000);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (downloadTimeoutRef.current) {
        clearTimeout(downloadTimeoutRef.current);
      }
      if (lastObjectUrlRef.current) {
        URL.revokeObjectURL(lastObjectUrlRef.current);
      }
    };
  }, []);

  const branchId = itinerary?.branchId;
  const { branchDetail, loading: branchLoading } = useBranchDetail({
    id: branchId,
  });

  const handleExport = useCallback(async () => {
    if (!itinerary) {
      toast({
        title: 'Export failed',
        description: 'No itinerary data available.',
        variant: 'destructive',
      });
      return;
    }

    if (branchLoading && branchId) {
      toast({
        title: 'Preparing export',
        description: 'Loading branch information for the PDF...',
      });
      return;
    }

    setGenerating(true);

    try {
      // Check blob cache first — skip full regeneration if data unchanged.
      const cacheKey = `${itinerary._id}:${
        itinerary.modifiedAt ?? Date.now()
      }:${branchId ?? ''}`;
      const cachedBlob = pdfBlobCache.get(cacheKey);
      if (cachedBlob) {
        const url = URL.createObjectURL(cachedBlob);
        triggerDownload(url, generateFilename(itinerary.name));
        toast({
          title: 'PDF exported',
          description: `"${
            itinerary.name || 'Itinerary'
          }" has been downloaded.`,
          variant: 'success',
        });
        setGenerating(false);
        return;
      }

      let totalImages = 0;
      let loadedImages = 0;

      const groupDaysWithImages = await Promise.all(
        (itinerary.groupDays || []).map(async (day) => {
          const images = day.images || [];
          if (images.length > 0) totalImages++;
          const base64Images = await convertImagesToBase64(images, 1);
          if (base64Images.length > 0) loadedImages++;
          return { ...day, base64Images };
        }),
      );

      const coverImages = itinerary.images || [];
      if (coverImages.length > 0 && coverImages[0]) totalImages++;
      const [coverImageBase64] = await convertImagesToBase64(
        coverImages.length > 0 && coverImages[0] ? [coverImages[0]] : [],
        1,
      );
      if (coverImageBase64) loadedImages++;

      const logoKey =
        branchDetail?.uiOptions?.mainLogo ||
        branchDetail?.uiOptions?.logo ||
        '';
      if (logoKey) totalImages++;
      const [mainLogoBase64] = await convertImagesToBase64(
        logoKey ? [logoKey] : [],
        1,
      );
      if (mainLogoBase64) loadedImages++;

      if (totalImages > 0 && loadedImages < totalImages) {
        toast({
          title: 'Some images failed to load',
          description: `${
            totalImages - loadedImages
          } of ${totalImages} image(s) could not be loaded. The PDF may have missing images.`,
        });
      }

      const primaryColor =
        branchDetail?.uiOptions?.colors?.primary || undefined;

      const blob = await pdf(
        <ItineraryPDF
          itinerary={{
            ...itinerary,
            groupDays: groupDaysWithImages,
            coverImageBase64,
          }}
          branch={{
            name: branchDetail?.name,
            mainLogoBase64,
            primaryColor,
          }}
        />,
      ).toBlob();

      setCachedPdf(cacheKey, blob);

      const url = URL.createObjectURL(blob);
      triggerDownload(url, generateFilename(itinerary.name));

      toast({
        title: 'PDF exported',
        description: `"${itinerary.name || 'Itinerary'}" has been downloaded.`,
        variant: 'success',
      });
    } catch (err) {
      toast({
        title: 'Export failed',
        description:
          err instanceof Error ? err.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  }, [
    branchDetail?.name,
    branchDetail?.uiOptions?.colors?.primary,
    branchDetail?.uiOptions?.logo,
    branchDetail?.uiOptions?.mainLogo,
    branchId,
    branchLoading,
    itinerary,
    toast,
    triggerDownload,
  ]);

  const isDisabled =
    !itinerary ||
    externalLoading ||
    generating ||
    (branchLoading && !!branchId);

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={isDisabled}
      onClick={handleExport}
    >
      {generating ? <Spinner /> : <IconFileTypePdf size={16} />}
      {size !== 'icon' && (generating ? 'Generating…' : 'Export as PDF')}
    </Button>
  );
};
