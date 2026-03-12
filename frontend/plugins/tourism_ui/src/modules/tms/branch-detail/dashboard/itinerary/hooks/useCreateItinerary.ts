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
  content?: string;
  duration?: number;
  color?: string;
  groupDays?: Array<{
    day?: number;
    title?: string;
    description?: string;
  }>;
  totalCost?: number;
  images?: string[];
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
