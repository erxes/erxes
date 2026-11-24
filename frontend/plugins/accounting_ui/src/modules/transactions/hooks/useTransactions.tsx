import {
  mergeGraphqlCursorData,
  toCursorPageInfo,
} from '@/utils/graphqlCursor';
import type {
  AccountingAccTransactionsQuery,
  AccountingAccTransactionsQueryVariables,
} from '~/gql/graphql';
import type { QueryHookOptions } from '@apollo/client';
import { toGraphqlView } from '@/utils/graphql';
import {
  applyListChange,
  toListSubscriptionFilter,
} from '@/transactions/utils/transactionListChange';
import { useQuery } from '@apollo/client';
import { useListPushGuard } from '@/transactions/hooks/useListPushGuard';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { EnumCursorDirection, validateFetchMore } from 'erxes-ui';
import { TRANSACTIONS_QUERY } from '../graphql/transactionQueries';
import { ACCOUNTING_TRANSACTIONS_LIST_CHANGED } from '@/transactions/graphql/transactionSubscriptions';
import { ACC_TRS__PER_PAGE } from '../types/constants';

import { useTransactionsVariables } from './useTransactionVars';

export const useTransactions = (
  options?: QueryHookOptions<
    AccountingAccTransactionsQuery,
    AccountingAccTransactionsQueryVariables
  >,
) => {
  const variables = useTransactionsVariables(options?.variables);
  const subscriptionFilter = toListSubscriptionFilter(variables);
  const subscriptionFilterKey = JSON.stringify(subscriptionFilter);
  const subscriptionFilterRef = useRef(subscriptionFilter);

  useLayoutEffect(() => {
    subscriptionFilterRef.current = subscriptionFilter;
  });

  const {
    data: queryData,
    loading,
    error,
    fetchMore,
    refetch,
    subscribeToMore,
  } = useQuery(TRANSACTIONS_QUERY, {
    fetchPolicy: 'cache-and-network',
    ...options,
    context: { ...options?.context, queryDeduplication: false },
    variables: {
      ...options?.variables,
      ...variables,
    },
  });
  const data = toGraphqlView(queryData);
  const { canApplyPush, track } = useListPushGuard(
    refetch,
    loading,
    options?.skip,
  );

  useEffect(() => {
    return subscribeToMore({
      document: ACCOUNTING_TRANSACTIONS_LIST_CHANGED,
      variables: { filter: subscriptionFilterRef.current },
      updateQuery: (prev, { subscriptionData }) => {
        const change = subscriptionData.data?.accountingTransactionsListChanged;
        const current = prev?.accTransactionsMain;

        if (!change || !canApplyPush(current, change.hasMore)) {
          return prev;
        }

        return {
          ...prev,
          accTransactionsMain: applyListChange(current, change),
        };
      },
    });
  }, [canApplyPush, subscribeToMore, subscriptionFilterKey]);

  const {
    list: transactions,
    totalCount,
    pageInfo,
  } = data?.accTransactionsMain || {};

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (
      !validateFetchMore({
        direction,
        pageInfo: toCursorPageInfo(pageInfo),
      })
    ) {
      return;
    }

    track(
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
            accTransactionsMain: mergeGraphqlCursorData({
              direction,
              fetchMoreResult: fetchMoreResult.accTransactionsMain,
              prevResult: prev.accTransactionsMain,
            }),
          });
        },
      }),
    );
  };

  return {
    loading: loading && !queryData,
    transactions,
    totalCount,
    error,
    handleFetchMore,
    pageInfo: toCursorPageInfo(pageInfo),
  };
};
