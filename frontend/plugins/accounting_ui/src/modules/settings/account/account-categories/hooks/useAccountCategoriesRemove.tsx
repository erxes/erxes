import { useMutation } from '@apollo/client';
import { ACCOUNT_CATEGORIES_REMOVE } from '@/settings/account/account-categories/graphql/mutations/accountsCategory';

export const useAccountCategoriesRemove = () => {
  const [removeAccountCategories, { loading }] = useMutation(
    ACCOUNT_CATEGORIES_REMOVE,
    {
      refetchQueries: ['accountingAccountCategories'],
      update(cache) {
        cache.evict({ fieldName: 'accountCategories' });
        cache.gc();
      },
    },
  );

  return {
    removeAccountCategories,
    loading,
  };
};
