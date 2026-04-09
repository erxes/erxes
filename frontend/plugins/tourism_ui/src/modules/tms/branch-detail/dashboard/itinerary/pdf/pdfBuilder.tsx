import React from 'react';
import { pdf } from '@react-pdf/renderer';
import type { IItineraryDetail } from '../hooks/useItineraryDetail';
import { ItineraryPDF } from './ItineraryPDF';
import { convertImagesToBase64 } from './utils';
import type { ItineraryPdfTemplate } from './types';

interface BranchDetailLike {
  _id?: string;
  name?: string;
  uiOptions?: {
    logo?: string;
  };
}

export interface BuildItineraryPdfResult {
  blob: Blob;
  cacheKey: string;
  loadedImages: number;
  totalImages: number;
  source: 'cache' | 'generated';
}

const pdfBlobCache = new Map<string, Blob>();
const MAX_PDF_CACHE_SIZE = 50;

interface ImageLoadStats {
  totalImages: number;
  loadedImages: number;
}

function setCachedPdf(key: string, blob: Blob) {
  if (pdfBlobCache.size >= MAX_PDF_CACHE_SIZE) {
    const firstKey = pdfBlobCache.keys().next().value;
    if (firstKey) pdfBlobCache.delete(firstKey);
  }

  pdfBlobCache.set(key, blob);
}

const createImageLoadStats = (): ImageLoadStats => ({
  totalImages: 0,
  loadedImages: 0,
});

const resolveBranchLogoKey = (branchDetail?: BranchDetailLike | null): string =>
  branchDetail?.uiOptions?.logo || '';

const convertTrackedSingleImage = async (
  imagePath?: string,
  stats?: ImageLoadStats,
): Promise<string> => {
  if (!imagePath) return '';

  if (stats) {
    stats.totalImages += 1;
  }

  const [base64Image] = await convertImagesToBase64([imagePath], 1);

  if (base64Image && stats) {
    stats.loadedImages += 1;
  }

  return base64Image || '';
};

export const generateItineraryPdfCacheKey = (
  itinerary: IItineraryDetail,
  branchId?: string,
  language?: string,
  template: ItineraryPdfTemplate = 'classic',
) =>
  [
    itinerary._id,
    itinerary.modifiedAt || itinerary.createdAt || 'unknown-modified',
    branchId || itinerary.branchId || '',
    language || itinerary.language || 'default',
    template,
  ].join(':');

export const buildItineraryPdfBlob = async ({
  itinerary,
  branchDetail,
  branchId,
  language,
  template = 'classic',
  force = false,
}: {
  itinerary: IItineraryDetail;
  branchDetail?: BranchDetailLike | null;
  branchId?: string;
  language?: string;
  template?: ItineraryPdfTemplate;
  force?: boolean;
}): Promise<BuildItineraryPdfResult> => {
  const cacheKey = generateItineraryPdfCacheKey(
    itinerary,
    branchId,
    language,
    template,
  );

  if (!force) {
    const cachedBlob = pdfBlobCache.get(cacheKey);
    if (cachedBlob) {
      return {
        blob: cachedBlob,
        cacheKey,
        loadedImages: 0,
        totalImages: 0,
        source: 'cache',
      };
    }
  }

  const imageLoadStats = createImageLoadStats();

  const groupDaysWithImages = await Promise.all(
    (itinerary.groupDays || []).map(async (day) => {
      const images = day.images || [];
      const firstImagePath = images[0];
      const base64Image = await convertTrackedSingleImage(
        firstImagePath,
        imageLoadStats,
      );

      return {
        ...day,
        base64Images: base64Image ? [base64Image] : [],
      };
    }),
  );

  const coverImageBase64 = await convertTrackedSingleImage(
    itinerary.images?.[0],
    imageLoadStats,
  );
  const mainLogoBase64 = await convertTrackedSingleImage(
    resolveBranchLogoKey(branchDetail),
    imageLoadStats,
  );

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
      }}
      template={template}
    />,
  ).toBlob();

  setCachedPdf(cacheKey, blob);

  return {
    blob,
    cacheKey,
    loadedImages: imageLoadStats.loadedImages,
    totalImages: imageLoadStats.totalImages,
    source: 'generated',
  };
};
