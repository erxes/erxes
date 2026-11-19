import type { ApolloError } from '@apollo/client';
import type { GraphqlMutationOptions } from '@/utils/graphqlMutation';
import { useMutation } from '@apollo/client';
import { ACC_TRANSACTIONS_UPDATE } from '../graphql/mutations/accTransactionsUpdate';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useTransactionsUpdate = (
  options?: GraphqlMutationOptions<typeof ACC_TRANSACTIONS_UPDATE>,
) => {
  const { t } = useTranslation('accounting');
  const [_updateTransaction, { loading }] = useMutation(
    ACC_TRANSACTIONS_UPDATE,
    options,
  );

  const updateTransaction = (
    options: GraphqlMutationOptions<typeof ACC_TRANSACTIONS_UPDATE>,
  ) => {
    return _updateTransaction({
      ...options,
      onError: (error: ApolloError) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
        options?.onError?.(error);
      },
      onCompleted: (data) => {
        toast({
          title: t('success'),
          description: t('transactions-updated-successfully'),
          variant: 'success',
        });
        options?.onCompleted?.(data);
      },
    });
  };

  return {
    updateTransaction,
    loading,
  };
};
