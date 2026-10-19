import { useMutation } from '@apollo/client';
import { CREATE_TOUR } from '../graphql/mutation';
import type {
  BmsTourAddMutation,
  BmsTourAddMutationVariables,
} from '~/gql/graphql';

export const useCreateTour = () => {
  const [createTourMutation, { loading, error }] = useMutation(CREATE_TOUR, {
    refetchQueries: ['BmsTours', 'BmToursGroup'],
    awaitRefetchQueries: true,
  });

  const createTour = (options: {
    variables: BmsTourAddMutationVariables;
    onCompleted?: (data: BmsTourAddMutation) => void;
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
