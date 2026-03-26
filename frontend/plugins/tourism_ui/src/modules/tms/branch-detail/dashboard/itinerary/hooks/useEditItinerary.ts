import { useMutation } from '@apollo/client';
import { EDIT_ITINERARY } from '../graphql/mutation';

interface EditItineraryResponse {
  bmsItineraryEdit: {
    _id: string;
  };
}

export interface IEditItineraryVariables {
  id: string;
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

export const useEditItinerary = () => {
  const [editItineraryMutation, { loading, error }] = useMutation<
    EditItineraryResponse,
    IEditItineraryVariables
  >(EDIT_ITINERARY, {
    refetchQueries: ['BmsItineraries'],
    awaitRefetchQueries: true,
  });

  const editItinerary = (options: {
    variables: IEditItineraryVariables;
    onCompleted?: (data: EditItineraryResponse) => void;
    onError?: (error: unknown) => void;
  }) => {
    return editItineraryMutation(options);
  };

  return {
    editItinerary,
    loading,
    error,
  };
};
