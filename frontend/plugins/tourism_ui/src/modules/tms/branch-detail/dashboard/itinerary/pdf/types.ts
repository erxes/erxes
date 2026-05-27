import type { IItineraryDetail } from '../hooks/useItineraryDetail';

type GroupDay = NonNullable<IItineraryDetail['groupDays']>[number];
export type ItineraryPdfTemplate = 'classic' | 'editorial';

export interface IGroupDayWithImages extends GroupDay {
  base64Images?: string[];
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
}
