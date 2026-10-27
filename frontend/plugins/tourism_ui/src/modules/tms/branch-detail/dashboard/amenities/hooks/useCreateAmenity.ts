import { useMutation } from '@apollo/client';
import { CREATE_AMENITY } from '../graphql/mutation';
import type {
  BmsAmenityAddMutation,
  BmsAmenityAddMutationVariables,
  BmsElementTranslationInput,
} from '~/gql/graphql';

export type IAmenityTranslationInput = BmsElementTranslationInput;

export const useCreateAmenity = () => {
  const [createAmenityMutation, { loading, error }] = useMutation(
    CREATE_AMENITY,
    {
      refetchQueries: ['BmsAmenities'],
      awaitRefetchQueries: true,
    },
  );

  const createAmenity = (options: {
    variables: BmsAmenityAddMutationVariables;
    onCompleted?: (data: BmsAmenityAddMutation) => void;
    onError?: (error: unknown) => void;
  }) => {
    return createAmenityMutation(options);
  };

  return {
    createAmenity,
    loading,
    error,
  };
};
