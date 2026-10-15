import type { GraphqlMutationOptions } from '@/utils/graphqlMutation';
import { useMutation } from '@apollo/client';
import { useTranslation } from 'react-i18next';
import { ACCOUNTS_EDIT } from '../graphql/mutations/accounts';
import { toast } from 'erxes-ui';

export const useAccountEdit = () => {
  const { t } = useTranslation('accounting');
  const [_editAccount, { loading }] = useMutation(ACCOUNTS_EDIT);

  const editAccount = (
    options: GraphqlMutationOptions<typeof ACCOUNTS_EDIT>,
    _fields: string[],
  ) => {
    const variables = options.variables;
    if (!variables?._id) throw new Error('Account id is required');
    return _editAccount({
      ...options,
      variables,
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
          description: t('account-updated-successfully'),
          variant: 'success',
        });
        options?.onCompleted?.(data);
      },
      refetchQueries: ['accountingAccountsMain'],
    });
  };

  return {
    editAccount,
    loading,
  };
};
