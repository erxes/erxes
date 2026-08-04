import { useMutation } from '@apollo/client';
import { CMS_CATEGORIES_EDIT } from '../graphql/mutations/categoriesEditMutation';

export const useEditCategory = () => {
  const [editCategoryMutation, { loading }] = useMutation(CMS_CATEGORIES_EDIT);

  const editCategory = ({ variables, ...options }: any) => {
    return editCategoryMutation({
      variables,
      refetchQueries: ['CategoryList'],
      ...options,
    });
  };

  return { editCategory, loading };
};
