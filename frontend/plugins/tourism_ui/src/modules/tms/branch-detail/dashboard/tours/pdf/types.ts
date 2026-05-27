import type { ITourDetail } from '../hooks/useTourDetail';
import type { IItineraryDetail } from '../../itinerary/hooks/useItineraryDetail';
import type {
  IBranchPDFData,
  IGroupDayWithImages,
} from '../../itinerary/pdf/types';

export interface ITourPDFData extends ITourDetail {
  coverImageBase64?: string;
  currencySymbol?: string;
}

export interface ITourItineraryPDFData extends Omit<
  IItineraryDetail,
  'groupDays'
> {
  groupDays?: IGroupDayWithImages[];
}

export interface TourPDFProps {
  tour: ITourPDFData;
  itinerary?: ITourItineraryPDFData | null;
  branch?: IBranchPDFData;
}
