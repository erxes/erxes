import { OperationVariables, useMutation } from '@apollo/client';
import { ACC_TRANSACTIONS_UPDATE } from '../graphql/mutations/accTransactionsUpdate';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  TRANSACTIONS_QUERY,
  TR_RECORDS_QUERY,
} from '../../graphql/transactionQueries';
import { useTransactionsVariables } from '../../hooks/useTransactionVars';

export const useTransactionsUpdate = (options?: OperationVariables) => {
  const { t } = useTranslation('accounting');
  const variables = useTransactionsVariables();
  const [_updateTransaction, { loading }] = useMutation(
    ACC_TRANSACTIONS_UPDATE,
    options,
  );

  const updateTransaction = (options: OperationVariables) => {
    return _updateTransaction({
      ...options,
      onError: (error: Error) => {
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
        });
        options?.onCompleted?.(data);
      },
      refetchQueries: [
        {
          query: TRANSACTIONS_QUERY,
          variables,
        },
        {
          query: TR_RECORDS_QUERY,
          variables,
        },
      ],
      awaitRefetchQueries: true,
    });
  };

  return {
    updateTransaction,
    loading,
  };
};
