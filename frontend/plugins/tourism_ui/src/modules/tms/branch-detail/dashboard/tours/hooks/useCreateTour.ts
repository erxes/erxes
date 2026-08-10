import { useMutation } from '@apollo/client';
import { CREATE_TOUR } from '../graphql/mutation';
import { ITourTranslationInput } from '../utils/translationHelpers';
import type { PricingOptionInput } from '../utils/pricingOptions';
import type { TourCustomFieldData } from '../utils/customFields';

interface CreateTourResponse {
  bmsTourAdd: {
    _id: string;
    name?: string;
    content?: string;
    branchId?: string;
    createdAt?: string;
  };
}

export interface ICreateTourVariables {
  branchId: string;
  language?: string;
  name: string;
  refNumber: string;
  content?: string;
  date_status:
    | 'running'
    | 'completed'
    | 'scheduled'
    | 'cancelled'
    | 'unscheduled';
  status?: string;
  customTourTypeId?: string;
  groupCode?: string;
  itineraryId?: string;
  dateType?: 'fixed' | 'flexible';
  startDate?: Date;
  endDate?: Date;
  availableFrom?: Date;
  availableTo?: Date;
  groupSize?: number;
  duration?: number;
  cost?: number;
  guides?: Array<{ guideId: string; type: string }>;
  info1?: string;
  info2?: string;
  info3?: string;
  info4?: string;
  info5?: string;
  images?: string[];
  imageThumbnail?: string;
  attachment?: { url: string; name: string; type: string; size: number } | null;
  advancePercent?: number;
  advanceCheck?: boolean;
  joinPercent?: number;
  personCost?: Record<string, any>;
  categoryIds?: string[];
  pricingOptions?: PricingOptionInput[];
  translations?: ITourTranslationInput[];
  customFieldsData?: TourCustomFieldData[];
}

export const useCreateTour = () => {
  const [createTourMutation, { loading, error }] = useMutation<
    CreateTourResponse,
    ICreateTourVariables
  >(CREATE_TOUR, {
    refetchQueries: ['BmsTours', 'BmToursGroup'],
    awaitRefetchQueries: true,
  });

  const createTour = (options: {
    variables: ICreateTourVariables;
    onCompleted?: (data: CreateTourResponse) => void;
    onError?: (error: unknown) => void;
  }) => {
    return createTourMutation(options);
  };

  return {
    createTour,
    loading,
    error,
  };
};
