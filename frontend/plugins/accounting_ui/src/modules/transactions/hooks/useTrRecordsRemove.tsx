import type { ApolloError } from '@apollo/client';
import type { GraphqlMutationOptions } from '@/utils/graphqlMutation';
import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ACC_TRANSACTIONS_REMOVE } from '../graphql/accTransactionsRemove';
import { TR_RECORDS_QUERY } from '../graphql/transactionQueries';
import { useTransactionsVariables } from './useTransactionVars';

export const useTrRecordsRemove = (
  options?: GraphqlMutationOptions<typeof ACC_TRANSACTIONS_REMOVE>,
) => {
  const { t } = useTranslation('accounting');
  const { toast } = useToast();
  const variables = useTransactionsVariables();
  const [_removeTrRecords, { loading }] = useMutation(
    ACC_TRANSACTIONS_REMOVE,
    options,
  );

  const removeTrRecords = (parentId?: string) => {
    return _removeTrRecords({
      variables: { parentId },
      onError: (error: ApolloError) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
      onCompleted: () => {
        toast({
          title: t('success'),
          description: t('tr-record-deleted-successfully'),
        });
      },
      refetchQueries: [
        {
          query: TR_RECORDS_QUERY,
          variables: {
            ...variables,
          },
        },
      ],
      awaitRefetchQueries: true,
    });
  };

  return {
    removeTrRecords,
    loading,
  };
};
