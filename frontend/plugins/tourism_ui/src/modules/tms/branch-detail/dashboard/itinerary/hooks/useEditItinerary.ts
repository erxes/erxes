import { useMutation } from '@apollo/client';
import { EDIT_ITINERARY } from '../graphql/mutation';
import type {
  BmsItineraryEditMutation,
  BmsItineraryEditMutationVariables,
} from '~/gql/graphql';

export const useEditItinerary = () => {
  const [editItineraryMutation, { loading, error }] = useMutation(
    EDIT_ITINERARY,
    {
      refetchQueries: ['BmsItineraries'],
      awaitRefetchQueries: true,
    },
  );

  const editItinerary = (options: {
    variables: BmsItineraryEditMutationVariables;
    onCompleted?: (data: BmsItineraryEditMutation) => void;
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
