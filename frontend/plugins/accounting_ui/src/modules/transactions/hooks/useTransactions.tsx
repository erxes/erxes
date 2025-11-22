import { OperationVariables, QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  ICursorListResponse,
  IRecordTableCursorPageInfo,
  mergeCursorData,
  useMultiQueryState,
  useRecordTableCursor,
  validateFetchMore
} from 'erxes-ui';
import { ACCTRANSACTIONS_CURSOR_SESSION_KEY } from '~/modules/accountsSessionKeys';
import { TRANSACTIONS_QUERY } from '../graphql/transactionQueries';
import { ACC_TRS__PER_PAGE } from '../types/constants';
import { ITransaction } from '../types/Transaction';

export const useTransactionsVariables = (
  variables?: QueryHookOptions<ICursorListResponse<ITransaction>>['variables'],
) => {
  const [queryParams] =
    useMultiQueryState<{
      searchValue?: string;
      code?: string;
      name?: string;
      categoryId?: string;
      currency?: string;
      kind?: string;
      journal?: string;

    }>(['code', 'name', 'categoryId', 'currency', 'kind', 'journal', 'searchValue']);

  const { cursor } = useRecordTableCursor({
    sessionKey: ACCTRANSACTIONS_CURSOR_SESSION_KEY,
  });

  const curVariables = Object.entries(queryParams).reduce((acc, [key, value]) => {
    if (value) {
      acc[key] = value + '';
    } return acc;
  }, {} as Record<string, string>);

  return {
    limit: ACC_TRS__PER_PAGE,
    orderBy: {
      date: 1
    },
    cursor,
    ...variables,
    ...curVariables
  };
};

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
