import { useQuery, OperationVariables } from '@apollo/client';
import { TRANSACTION_DETAIL_QUERY } from '../graphql/queries/accTransactionDetail';
import { ITransaction } from '../../types/Transaction';
import { useSetAtom } from 'jotai';
import { followTrDocsState } from '../states/trStates';

export const useTransactionDetail = (options?: OperationVariables) => {
  const { data, loading, error } = useQuery<
    { accTransactionDetail: ITransaction[] },
    OperationVariables
  >(TRANSACTION_DETAIL_QUERY, {
    ...options,
  });

  const transactions = data?.accTransactionDetail;
  const ftrDocs = transactions?.filter(tr => tr.originId) || [];
  const setFollowTrDocs = useSetAtom(followTrDocsState);
  setFollowTrDocs(ftrDocs)

  return {
    transactions,
    activeTrs: transactions?.filter(tr => !tr.originId),
    loading,
    error,
  };
};
