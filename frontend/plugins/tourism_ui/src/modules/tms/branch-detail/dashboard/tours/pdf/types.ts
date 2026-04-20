import type { ITourDetail } from '../hooks/useTourDetail';
import type { IItineraryDetail } from '../../itinerary/hooks/useItineraryDetail';
import type {
  IBranchPDFData,
  IGroupDayWithImages,
  ItineraryPdfRenderConfig,
} from '../../itinerary/pdf/types';
import {
  DEFAULT_ITINERARY_PDF_CONFIG,
  DEFAULT_ITINERARY_PDF_LABELS,
} from '../../itinerary/pdf/types';

export interface TourPdfLabels {
  coverEyebrow: string;
  coverFallbackSubtitle: string;
  coverDurationLabel: string;
  coverDaySingularLabel: string;
  coverDayPluralLabel: string;
  detailsPageHeaderTitle: string;
  detailsIntroEyebrow: string;
  overviewReferenceLabel: string;
  overviewDurationLabel: string;
  overviewTravelDatesLabel: string;
  overviewAvailableRangeLabel: string;
  overviewGroupSizeLabel: string;
  pricingSectionTitle: string;
  pricingUntitledOptionLabel: string;
  pricingPerPersonLabel: string;
  pricingAdultLabel: string;
  pricingChildLabel: string;
  pricingInfantLabel: string;
  pricingAccommodationLabel: string;
  pricingDomesticFlightLabel: string;
  pricingSingleSupplementLabel: string;
  summarySectionTitle: string;
  includedSectionTitle: string;
  notIncludedSectionTitle: string;
  highlightsSectionTitle: string;
  additionalInfoSectionTitle: string;
  paxSuffixLabel: string;
  upToLabel: string;
  untitledTourTitle: string;
}

export interface TourPdfRenderConfig {
  showCoverPage: boolean;
  showDetailsPage: boolean;
  showItineraryPage: boolean;
  labels: TourPdfLabels;
  itineraryConfig: ItineraryPdfRenderConfig;
}

export const DEFAULT_TOUR_PDF_LABELS: TourPdfLabels = {
  coverEyebrow: 'Tour Book',
  coverFallbackSubtitle: 'Custom Tour',
  coverDurationLabel: 'Duration',
  coverDaySingularLabel: 'Day',
  coverDayPluralLabel: 'Days',
  detailsPageHeaderTitle: 'TOUR OVERVIEW',
  detailsIntroEyebrow: 'Tour Information',
  overviewReferenceLabel: 'Reference',
  overviewDurationLabel: 'Duration',
  overviewTravelDatesLabel: 'Travel Dates',
  overviewAvailableRangeLabel: 'Available Range',
  overviewGroupSizeLabel: 'Group Size',
  pricingSectionTitle: 'Pricing Options',
  pricingUntitledOptionLabel: 'Untitled option',
  pricingPerPersonLabel: 'Price / Person',
  pricingAdultLabel: 'Adult',
  pricingChildLabel: 'Child',
  pricingInfantLabel: 'Infant',
  pricingAccommodationLabel: 'Accommodation',
  pricingDomesticFlightLabel: 'Domestic Flight',
  pricingSingleSupplementLabel: 'Single Supplement',
  summarySectionTitle: 'Summary',
  includedSectionTitle: 'Included',
  notIncludedSectionTitle: 'Not Included',
  highlightsSectionTitle: 'Highlights',
  additionalInfoSectionTitle: 'Additional Information',
  paxSuffixLabel: 'pax',
  upToLabel: 'Up to',
  untitledTourTitle: 'Untitled Tour',
};

export const createDefaultTourPdfConfig = (): TourPdfRenderConfig => ({
  showCoverPage: true,
  showDetailsPage: true,
  showItineraryPage: true,
  labels: { ...DEFAULT_TOUR_PDF_LABELS },
  itineraryConfig: {
    ...DEFAULT_ITINERARY_PDF_CONFIG,
    labels: { ...DEFAULT_ITINERARY_PDF_LABELS },
  },
});

export interface ITourPDFData extends ITourDetail {
  coverImageBase64?: string;
  currencySymbol?: string;
}

export interface ITourItineraryPDFData
  extends Omit<IItineraryDetail, 'groupDays'> {
  groupDays?: IGroupDayWithImages[];
}

export interface TourPDFProps {
  tour: ITourPDFData;
  itinerary?: ITourItineraryPDFData | null;
  branch?: IBranchPDFData;
  config?: TourPdfRenderConfig;
}
