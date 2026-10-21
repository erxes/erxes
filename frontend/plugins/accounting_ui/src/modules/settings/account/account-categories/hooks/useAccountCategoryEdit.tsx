import { useMutation } from '@apollo/client';
import { ACCOUNT_CATEGORIES_EDIT } from '@/settings/account/account-categories/graphql/mutations/accountsCategory';

export const useAccountCategoryEdit = () => {
  const [editAccountCategory, { loading }] = useMutation(
    ACCOUNT_CATEGORIES_EDIT,
    {
      refetchQueries: ['accountingAccountCategories'],
      update(cache) {
        cache.evict({ fieldName: 'accountCategories' });
        cache.gc();
      },
    },
  );

  return {
    editAccountCategory,
    loading,
  };
};
