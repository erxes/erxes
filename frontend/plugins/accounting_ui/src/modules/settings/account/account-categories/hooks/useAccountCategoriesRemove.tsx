import { useMutation } from '@apollo/client';
import { ACCOUNT_CATEGORIES_REMOVE } from '../graphql/mutations/accountsCategory';

export const useAccountCategoriesRemove = () => {
  const [removeAccountCategories, { loading }] = useMutation(
    ACCOUNT_CATEGORIES_REMOVE,
    {
      refetchQueries: ['accountCategories'],
    },
  );

  return {
    removeAccountCategories,
    loading,
  };
};
