import { useMutation } from '@apollo/client';
import { CREATE_TOUR } from '../graphql/mutation';

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
  guides?: Array<{ guideId: string; name?: string }>;
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
  pricingOptions?: Array<{
    title: string;
    minPersons: number;
    maxPersons?: number;
    pricePerPerson: number;
    accommodationType?: string;
    domesticFlightPerPerson?: number;
    singleSupplement?: number;
    note?: string;
  }>;
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
