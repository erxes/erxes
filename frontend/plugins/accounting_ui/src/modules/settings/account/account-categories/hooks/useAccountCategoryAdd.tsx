import { useMutation } from '@apollo/client';
import { ACCOUNT_CATEGORIES_ADD } from '@/settings/account/account-categories/graphql/mutations/accountsCategory';

export const useAccountCategoryAdd = () => {
  const [addAccountCategory, { loading }] = useMutation(
    ACCOUNT_CATEGORIES_ADD,
    {
      refetchQueries: ['accountingAccountCategories'],
      update(cache) {
        cache.evict({ fieldName: 'accountCategories' });
        cache.gc();
      },
    },
  );

  return { addAccountCategory, loading };
};
