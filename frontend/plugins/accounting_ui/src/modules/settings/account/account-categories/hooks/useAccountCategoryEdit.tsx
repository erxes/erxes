import { useMutation } from '@apollo/client';
import { ACCOUNT_CATEGORIES_EDIT } from '../graphql/mutations/accountsCategory';

export const useAccountCategoryEdit = () => {
  const [editAccountCategory, { loading }] = useMutation(
    ACCOUNT_CATEGORIES_EDIT,
    {
      refetchQueries: ['accountingAccountCategories'],
    },
  );

  return {
    editAccountCategory,
    loading,
  };
};
