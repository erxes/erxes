import React, { useCallback, useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { IconFileTypePdf } from '@tabler/icons-react';
import { Button, Spinner, useToast } from 'erxes-ui';
import type { IItineraryDetail } from '../hooks/useItineraryDetail';
import { ItineraryPDF } from './ItineraryPDF';
import { generateFilename, convertImagesToBase64 } from './utils';
import { useBranchDetail } from '@/tms/hooks/BranchDetail';

/**
 * Module-level blob cache: key = `${itinerary._id}:${modifiedAt}:${branchId}`.
 * Skips full PDF regeneration when the same data is exported again.
 */
const pdfBlobCache = new Map<string, Blob>();

/**
 * Creates a temporary <a> element to trigger a file download, then cleans up.
 */
function triggerDownload(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
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
      const cacheKey = `${itinerary._id}:${itinerary.modifiedAt ?? ''}:${branchId ?? ''}`;
      const cachedBlob = pdfBlobCache.get(cacheKey);
      if (cachedBlob) {
        const url = URL.createObjectURL(cachedBlob);
        triggerDownload(url, generateFilename(itinerary.name));
        toast({
          title: 'PDF exported',
          description: `"${itinerary.name || 'Itinerary'}" has been downloaded.`,
          variant: 'success',
        });
        setGenerating(false);
        return;
      }

      const groupDaysWithImages = await Promise.all(
        (itinerary.groupDays || []).map(async (day) => ({
          ...day,
          base64Images: await convertImagesToBase64(day.images || [], 1),
        })),
      );

      const coverImages = itinerary.images || [];
      const [coverImageBase64] = await convertImagesToBase64(
        coverImages.length > 0 && coverImages[0] ? [coverImages[0]] : [],
        1,
      );

      const logoKey =
        branchDetail?.uiOptions?.mainLogo ||
        branchDetail?.uiOptions?.logo ||
        '';
      const [mainLogoBase64] = await convertImagesToBase64(
        logoKey ? [logoKey] : [],
        1,
      );

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

      pdfBlobCache.set(cacheKey, blob);

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
