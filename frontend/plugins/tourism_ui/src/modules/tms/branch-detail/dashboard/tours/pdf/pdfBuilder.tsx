import React from 'react';
import type { IBranch } from '@/tms/types/branch';
import { LANGUAGES } from '@/tms/constants/languages';
import { convertImagesToBase64 } from '../../itinerary/pdf/utils';
import type { IItineraryDetail } from '../../itinerary/hooks/useItineraryDetail';
import type {
  ItineraryPdfAmenityData,
  ItineraryPdfElementData,
} from '../../itinerary/pdf/types';
import type {
  IPricingOption,
  IPricingOptionTranslation,
  ITourDetail,
  ITourTranslation,
} from '../hooks/useTourDetail';
import { pdf } from '@react-pdf/renderer';
import { TourPDF } from './TourPDF';
import type { TourPdfRenderConfig } from './types';

export interface LocalizedTourDetail extends ITourDetail {
  coverImageBase64?: string;
  currencySymbol?: string;
}

export interface BuildTourPdfResult {
  blob: Blob;
  cacheKey: string;
  loadedImages: number;
  totalImages: number;
  source: 'cache' | 'generated';
}

interface ImageLoadStats {
  totalImages: number;
  loadedImages: number;
}

const pdfBlobCache = new Map<string, Blob>();
const MAX_PDF_CACHE_SIZE = 50;

const createImageLoadStats = (): ImageLoadStats => ({
  totalImages: 0,
  loadedImages: 0,
});

function setCachedPdf(key: string, blob: Blob) {
  if (pdfBlobCache.size >= MAX_PDF_CACHE_SIZE) {
    const firstKey = pdfBlobCache.keys().next().value;
    if (firstKey) pdfBlobCache.delete(firstKey);
  }

  pdfBlobCache.set(key, blob);
}

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

const mergePricingOptionTranslation = (
  option: IPricingOption,
  translation?: IPricingOptionTranslation,
): IPricingOption => ({
  ...option,
  ...(translation?.title ? { title: translation.title } : {}),
  ...(translation?.accommodationType
    ? { accommodationType: translation.accommodationType }
    : {}),
  ...(translation?.note ? { note: translation.note } : {}),
  ...(translation?.prices?.length ? { prices: translation.prices } : {}),
  ...(typeof translation?.pricePerPerson === 'number'
    ? { pricePerPerson: translation.pricePerPerson }
    : {}),
  ...(typeof translation?.domesticFlightPerPerson === 'number'
    ? { domesticFlightPerPerson: translation.domesticFlightPerPerson }
    : {}),
  ...(typeof translation?.singleSupplement === 'number'
    ? { singleSupplement: translation.singleSupplement }
    : {}),
});

export const resolveTourForPdf = (
  tour: ITourDetail,
  language?: string,
): LocalizedTourDetail => {
  if (!language) {
    return tour;
  }

  const translation = tour.translations?.find(
    (item: ITourTranslation) => item.language === language,
  );

  if (!translation) {
    return tour;
  }

  const pricingTranslationMap = new Map(
    (translation.pricingOptions || []).map((item) => [item.optionId, item]),
  );

  return {
    ...tour,
    name: translation.name || tour.name,
    refNumber: translation.refNumber || tour.refNumber,
    content: translation.content || tour.content,
    info1: translation.info1 || tour.info1,
    info2: translation.info2 || tour.info2,
    info3: translation.info3 || tour.info3,
    info4: translation.info4 || tour.info4,
    info5: translation.info5 || tour.info5,
    pricingOptions: (tour.pricingOptions || []).map((option) =>
      mergePricingOptionTranslation(
        option,
        pricingTranslationMap.get(option._id),
      ),
    ),
  };
};

export const generateTourPdfCacheKey = ({
  tour,
  itinerary,
  branchId,
  language,
  config,
}: {
  tour: ITourDetail;
  itinerary?: IItineraryDetail | null;
  branchId?: string;
  language?: string;
  config?: TourPdfRenderConfig;
}) =>
  [
    tour._id,
    tour.modifiedAt || tour.createdAt || '',
    itinerary?._id || '',
    itinerary?.modifiedAt || '',
    branchId || '',
    language || '',
    JSON.stringify(config || {}),
  ].join(':');

export const buildTourPdfBlob = async ({
  tour,
  itinerary,
  branchDetail,
  branchId,
  language,
  config,
  elements,
  amenities,
  force = false,
}: {
  tour: LocalizedTourDetail;
  itinerary?: IItineraryDetail | null;
  branchDetail?: IBranch | null;
  branchId?: string;
  language?: string;
  config?: TourPdfRenderConfig;
  elements?: ItineraryPdfElementData[];
  amenities?: ItineraryPdfAmenityData[];
  force?: boolean;
}): Promise<BuildTourPdfResult> => {
  const currencySymbol =
    LANGUAGES.find((item) => item.value === language)?.symbol ??
    LANGUAGES.find((item) => item.value === tour.language)?.symbol ??
    '$';

  const cacheKey = generateTourPdfCacheKey({
    tour,
    itinerary,
    branchId,
    language,
    config,
  });

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
  const elementMap = new Map(
    (elements || []).map((element) => [element._id, element]),
  );
  const amenityMap = new Map(
    (amenities || []).map((amenity) => [amenity._id, amenity]),
  );

  const itineraryWithImages = itinerary
    ? {
        ...itinerary,
        groupDays: await Promise.all(
          (itinerary.groupDays || []).map(async (day) => {
            const base64Image = await convertTrackedSingleImage(
              day.images?.[0],
              imageLoadStats,
            );

            return {
              ...day,
              base64Images: base64Image ? [base64Image] : [],
              resolvedElements: (day.elements || [])
                .slice()
                .sort((a, b) => (a.orderOfDay || 0) - (b.orderOfDay || 0))
                .map((item) => item.elementId && elementMap.get(item.elementId))
                .filter((element): element is ItineraryPdfElementData =>
                  Boolean(element),
                ),
              resolvedAmenities: (day.elementsQuick || [])
                .slice()
                .sort((a, b) => (a.orderOfDay || 0) - (b.orderOfDay || 0))
                .map((item) => item.elementId && amenityMap.get(item.elementId))
                .filter((amenity): amenity is ItineraryPdfAmenityData =>
                  Boolean(amenity),
                ),
            };
          }),
        ),
      }
    : null;

  const coverImageCandidates = [
    tour.imageThumbnail,
    ...(tour.images || []),
    ...(itinerary?.images || []),
  ].filter(Boolean);
  const coverImageBase64 = await convertTrackedSingleImage(
    coverImageCandidates[0],
    imageLoadStats,
  );
  const mainLogoBase64 = await convertTrackedSingleImage(
    branchDetail?.uiOptions?.mainLogo || branchDetail?.uiOptions?.logo || '',
    imageLoadStats,
  );

  const blob = await pdf(
    <TourPDF
      tour={{
        ...tour,
        coverImageBase64,
        currencySymbol,
      }}
      itinerary={itineraryWithImages}
      branch={{
        mainLogoBase64,
      }}
      config={config}
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
