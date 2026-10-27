import { useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { toast } from 'erxes-ui';
import { ACCOUNT_CATEGORIES_ADD } from '@/settings/account/account-categories/graphql/mutations/accountsCategory';

export const useAccountCategoryAdd = () => {
  const { t } = useTranslation('accounting');
  const [addAccountCategory, { loading }] = useMutation(
    ACCOUNT_CATEGORIES_ADD,
    {
      refetchQueries: ['accountingAccountCategories'],
      update(cache) {
        cache.evict({ fieldName: 'accountCategories' });
        cache.gc();
      },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    },
  );

  return { addAccountCategory, loading };
};
