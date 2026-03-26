import { useMutation } from '@apollo/client';
import { CREATE_ITINERARY } from '../graphql/mutation';

interface CreateItineraryResponse {
  bmsItineraryAdd: {
    _id: string;
  };
}

export interface ICreateItineraryVariables {
  branchId?: string;
  name?: string;
  duration?: number;
  color?: string;
  images?: string[];
  groupDays?: Array<{
    day?: number;
    title?: string;
    content?: string;
    elements?: Array<{ elementId?: string; orderOfDay?: number }>;
    elementsQuick?: Array<{ elementId?: string; orderOfDay?: number }>;
    images?: string[];
  }>;
  totalCost?: number;
  guideCost?: number;
  driverCost?: number;
  foodCost?: number;
  gasCost?: number;
  personCost?: Record<string, number>;
  guideCostExtra?: number;
  content?: string;
}

export const useCreateItinerary = () => {
  const [createItineraryMutation, { loading, error }] = useMutation<
    CreateItineraryResponse,
    ICreateItineraryVariables
  >(CREATE_ITINERARY, {
    refetchQueries: ['BmsItineraries'],
    awaitRefetchQueries: true,
  });

  const createItinerary = (options: {
    variables: ICreateItineraryVariables;
    onCompleted?: (data: CreateItineraryResponse) => void;
    onError?: (error: unknown) => void;
  }) => {
    return createItineraryMutation(options);
  };

  return {
    createItinerary,
    loading,
    error,
  };
};
