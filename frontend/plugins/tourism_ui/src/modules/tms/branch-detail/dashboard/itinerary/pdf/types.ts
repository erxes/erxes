import type { IItineraryDetail } from '../hooks/useItineraryDetail';
import type { PdfTemplateDocument } from './custom-template/template.types';

type GroupDay = NonNullable<IItineraryDetail['groupDays']>[number];
export type ItineraryPdfTemplate = 'classic' | 'editorial' | 'custom';

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
  customTemplate?: PdfTemplateDocument;
}
