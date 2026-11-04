import { useMutation } from '@apollo/client';
import { CREATE_ITINERARY } from '../graphql/mutation';
import type {
  BmsItineraryAddMutation,
  BmsItineraryAddMutationVariables,
  ItineraryTranslationInput,
} from '~/gql/graphql';

export type IItineraryTranslationInput = ItineraryTranslationInput;

export const useCreateItinerary = () => {
  const [createItineraryMutation, { loading, error }] = useMutation(
    CREATE_ITINERARY,
    {
      refetchQueries: ['BmsItineraries'],
      awaitRefetchQueries: true,
    },
  );

  const createItinerary = (options: {
    variables: BmsItineraryAddMutationVariables;
    onCompleted?: (data: BmsItineraryAddMutation) => void;
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
