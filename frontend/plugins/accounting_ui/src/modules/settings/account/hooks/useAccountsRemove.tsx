import type { GraphqlMutationOptions } from '@/utils/graphqlMutation';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { toast } from 'erxes-ui';
import { ACCOUNTS_REMOVE } from '../graphql/mutations/accounts';

export const useAccountsRemove = () => {
  const { t } = useTranslation('accounting');
  const [_removeAccounts, { loading }] = useMutation(ACCOUNTS_REMOVE);

  const removeAccounts = (
    options: GraphqlMutationOptions<typeof ACCOUNTS_REMOVE>,
  ) => {
    return _removeAccounts({
      ...options,
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
        options.onError?.(error);
      },
      onCompleted: (data) => {
        toast({
          title: t('success'),
          description: t('account-deleted-successfully'),
        });
        options.onCompleted?.(data);
      },
      refetchQueries: ['accountingAccountsMain'],
    });
  };

  return {
    removeAccounts,
    loading,
  };
};
