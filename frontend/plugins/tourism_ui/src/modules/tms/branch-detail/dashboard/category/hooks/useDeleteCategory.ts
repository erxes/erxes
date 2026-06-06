import { useMutation } from '@apollo/client';
import { REMOVE_CATEGORY } from '../graphql/mutation';

export const useDeleteCategory = () => {
  const [deleteCategoryMutation] = useMutation(REMOVE_CATEGORY, {
    refetchQueries: ['BmsTourCategories'],
  });

  return deleteCategoryMutation;
};
