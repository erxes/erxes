import { useMutation } from '@apollo/client';
import { EDIT_AMENITY } from '../graphql/mutation';
import type {
  BmsAmenityEditMutation,
  BmsAmenityEditMutationVariables,
} from '~/gql/graphql';

export const useEditAmenity = () => {
  const [editAmenityMutation, { loading, error }] = useMutation(EDIT_AMENITY, {
    refetchQueries: ['BmsAmenities'],
    awaitRefetchQueries: true,
  });

  const editAmenity = (options: {
    variables: BmsAmenityEditMutationVariables;
    onCompleted?: (data: BmsAmenityEditMutation) => void;
    onError?: (error: unknown) => void;
  }) => {
    return editAmenityMutation(options);
  };

  return {
    editAmenity,
    loading,
    error,
  };
};
