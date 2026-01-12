import { OperationVariables, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  mergeCursorData,
  validateFetchMore,
} from 'erxes-ui';
import { TRANSACTIONS_QUERY } from '../graphql/transactionQueries';
import { ACC_TRS__PER_PAGE } from '../types/constants';
import { ITransaction } from '../types/Transaction';
import { useTransactionsVariables } from './useTransactionVars';

export const useTransactions = (options?: OperationVariables) => {
  const variables = useTransactionsVariables(options?.variables);

  const { data, loading, error, fetchMore } = useQuery<{
    accTransactionsMain: {
      list: ITransaction[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>(TRANSACTIONS_QUERY, {
    ...options,
    variables: {
      ...options?.variables,
      ...variables
    },
  });

  const { list: transactions, totalCount, pageInfo } = data?.accTransactionsMain || {};

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (
      !validateFetchMore({
        direction,
        pageInfo,
      })
    ) {
      return;
    }

    fetchMore({
      variables: {
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: ACC_TRS__PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          accTransactionsMain: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.accTransactionsMain,
            prevResult: prev.accTransactionsMain,
          }),
        });
      },
    });
  };

  return {
    loading,
    transactions,
    totalCount,
    error,
    handleFetchMore,
    pageInfo,
  };

};
