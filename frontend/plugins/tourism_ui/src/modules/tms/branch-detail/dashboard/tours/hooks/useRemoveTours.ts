import { ApolloError, useMutation } from '@apollo/client';
import { REMOVE_TOUR } from '../graphql/mutation';
import type {
  BmsTourRemoveMutation,
  BmsTourRemoveMutationVariables,
} from '~/gql/graphql';

export const useRemoveTours = () => {
  const [removeToursMutation, { loading, error }] = useMutation(REMOVE_TOUR, {
    refetchQueries: ['BmsTours', 'BmToursGroup'],
    awaitRefetchQueries: true,
  });

  const removeTours = (options: {
    variables: BmsTourRemoveMutationVariables;
    onCompleted?: (data: BmsTourRemoveMutation) => void;
    onError?: (error: ApolloError) => void;
  }) => {
    return removeToursMutation(options);
  };

  return {
    removeTours,
    loading,
    error,
  };
};
