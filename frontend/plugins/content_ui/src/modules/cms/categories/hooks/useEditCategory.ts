import { MutationFunctionOptions, useMutation } from '@apollo/client';
import type {
  CmsCategoriesEditMutation,
  CmsCategoriesEditMutationVariables,
} from '~/gql/graphql';
import { CMS_CATEGORIES_EDIT } from '../graphql/mutations/categoriesEditMutation';

export const useEditCategory = () => {
  const [editCategoryMutation, { loading }] = useMutation(CMS_CATEGORIES_EDIT);

  const editCategory = ({
    variables,
    ...options
  }: MutationFunctionOptions<
    CmsCategoriesEditMutation,
    CmsCategoriesEditMutationVariables
  >) => {
    return editCategoryMutation({
      variables,
      refetchQueries: ['CategoryList'],
      ...options,
    });
  };

  return { editCategory, loading };
};
