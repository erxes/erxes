import { useMutation } from '@apollo/client';
import { EDIT_CATEGORY } from '../graphql/mutation';
import type {
  BmsTourCategoryEditMutation,
  BmsTourCategoryEditMutationVariables,
} from '~/gql/graphql';

export const useEditCategory = () => {
  const [editCategoryMutation, { loading, error }] = useMutation(
    EDIT_CATEGORY,
    {
      refetchQueries: ['BmsTourCategories'],
      awaitRefetchQueries: true,
    },
  );

  const editCategory = (options: {
    variables: BmsTourCategoryEditMutationVariables;
    onCompleted?: (data: BmsTourCategoryEditMutation) => void;
    onError?: (error: unknown) => void;
  }) => {
    return editCategoryMutation(options);
  };

  return {
    editCategory,
    loading,
    error,
  };
};
