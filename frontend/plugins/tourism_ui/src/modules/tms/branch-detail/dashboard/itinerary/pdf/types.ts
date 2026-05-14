import type { IItineraryDetail } from '../hooks/useItineraryDetail';

type GroupDay = NonNullable<IItineraryDetail['groupDays']>[number];
export type ItineraryPdfTemplate = 'classic' | 'editorial';

export interface ItineraryPdfElementData {
  _id: string;
  name?: string;
  note?: string;
  content?: string;
  startTime?: string;
  duration?: number;
  cost?: number;
}

export interface ItineraryPdfAmenityData {
  _id: string;
  name?: string;
  icon?: string;
}

export interface ItineraryPdfLabels {
  pageHeaderTitle: string;
  coverDurationLabel: string;
  coverDaysLabel: string;
  dayLabel: string;
  dayOverviewTitle: string;
  dayActivitiesTitle: string;
  footerNotesTitle: string;
  footerPageCounter: string;
}

export const DEFAULT_ITINERARY_PDF_LABELS: ItineraryPdfLabels = {
  pageHeaderTitle: 'ITINERARY',
  coverDurationLabel: 'Duration',
  coverDaysLabel: 'Days',
  dayLabel: 'DAY',
  dayOverviewTitle: 'Overview',
  dayActivitiesTitle: 'Activities',
  footerNotesTitle: 'ITINERARY NOTES',
  footerPageCounter: 'Page {page} of {total}',
};

export const DEFAULT_ITINERARY_PDF_CONFIG: ItineraryPdfRenderConfig = {
  showCoverPage: true,
  showFooterPage: true,
  showDayContent: true,
  showElements: false,
  showAmenities: false,
  labels: { ...DEFAULT_ITINERARY_PDF_LABELS },
};

export interface ItineraryPdfRenderConfig {
  showCoverPage: boolean;
  showFooterPage: boolean;
  showDayContent: boolean;
  showElements: boolean;
  showAmenities: boolean;
  labels: ItineraryPdfLabels;
}

export interface IGroupDayWithImages extends GroupDay {
  base64Images?: string[];
  resolvedElements?: ItineraryPdfElementData[];
  resolvedAmenities?: ItineraryPdfAmenityData[];
}

export interface IItineraryPDFData extends Omit<IItineraryDetail, 'groupDays'> {
  groupDays?: IGroupDayWithImages[];
  coverImageBase64?: string;
}

export interface IBranchPDFData {
  name?: string;
  mainLogoBase64?: string;
}

export interface ItineraryPDFProps {
  itinerary: IItineraryPDFData;
  branch?: IBranchPDFData;
  template?: ItineraryPdfTemplate;
  config?: ItineraryPdfRenderConfig;
}
