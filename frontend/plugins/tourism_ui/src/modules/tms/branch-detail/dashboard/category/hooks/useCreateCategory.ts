import { useMutation } from '@apollo/client';
import { CREATE_CATEGORY } from '../graphql/mutation';
import type {
  BmsTourCategoryAddMutation,
  BmsTourCategoryAddMutationVariables,
  TourCategoryTranslationInput,
} from '~/gql/graphql';

export type ICategoryTranslationInput = TourCategoryTranslationInput;

export const useCreateCategory = () => {
  const [createCategoryMutation, { loading, error }] = useMutation(
    CREATE_CATEGORY,
    {
      refetchQueries: ['BmsTourCategories'],
      awaitRefetchQueries: true,
    },
  );

  const createCategory = (options: {
    variables: BmsTourCategoryAddMutationVariables;
    onCompleted?: (data: BmsTourCategoryAddMutation) => void;
    onError?: (error: unknown) => void;
  }) => {
    return createCategoryMutation(options);
  };

  return {
    createCategory,
    loading,
    error,
  };
};
