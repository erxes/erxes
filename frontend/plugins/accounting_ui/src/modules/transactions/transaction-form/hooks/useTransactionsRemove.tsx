import { OperationVariables, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ACC_TRANSACTIONS_REMOVE } from '../../graphql/accTransactionsRemove';
import { TRANSACTIONS_QUERY } from '../../graphql/transactionQueries';
import { useTransactionsVariables } from '../../hooks/useTransactionVars';
import {
  getCurrentTransactionReturnPath,
  getTransactionReturnPath,
} from '../../utils/transactionNavigation';

export const useTransactionsRemove = (options?: OperationVariables) => {
  const { t } = useTranslation('accounting');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const returnPath = getTransactionReturnPath(
    searchParams.get('returnTo') || getCurrentTransactionReturnPath(location),
  );
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
      update: () => {
        navigate(returnPath);
      },
    });
  };

  return {
    removeTransactions,
    loading,
  };
};
