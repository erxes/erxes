import { OperationVariables, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ACC_TRANSACTIONS_REMOVE } from '../../graphql/accTransactionsRemove';
import { TRANSACTIONS_QUERY } from '../../graphql/transactionQueries';
import { useTransactionsVariables } from '../../hooks/useTransactionVars';

export const useTransactionsRemove = (options?: OperationVariables) => {
  const { t } = useTranslation('accounting');
  const navigate = useNavigate();
  const variables = useTransactionsVariables();

  const [_removeTransactions, { loading }] = useMutation(
    ACC_TRANSACTIONS_REMOVE,
    options,
  );
  const { toast } = useToast();

  const removeTransactions = (parentId?: string) => {
    return _removeTransactions({
      variables: { parentId },
      onError: (error: Error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
      onCompleted: () => {
        toast({
          title: t('success'),
          description: t('transactions-deleted-successfully'),
        });
      },
      refetchQueries: [
        {
          query: TRANSACTIONS_QUERY,
          variables,
        },
      ],
      awaitRefetchQueries: true,
      update: (cache) => {
        const pathname = '/accounting/main';
        navigate(pathname);
      },
    });
  };

  return {
    removeTransactions,
    loading,
  };
};
