import {
  mergeGraphqlCursorData,
  toCursorPageInfo,
} from '@/utils/graphqlCursor';
import type {
  AccountingAccTrRecordsQuery,
  AccountingAccTrRecordsQueryVariables,
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
import { TR_RECORDS_QUERY } from '../graphql/transactionQueries';
import { ACCOUNTING_TR_RECORDS_LIST_CHANGED } from '@/transactions/graphql/transactionSubscriptions';
import { ACC_TRS__PER_PAGE } from '../types/constants';

import { useTransactionsVariables } from './useTransactionVars';

export const useTrRecords = (
  options?: QueryHookOptions<
    AccountingAccTrRecordsQuery,
    AccountingAccTrRecordsQueryVariables
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
  } = useQuery(TR_RECORDS_QUERY, {
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
      document: ACCOUNTING_TR_RECORDS_LIST_CHANGED,
      variables: { filter: subscriptionFilterRef.current },
      updateQuery: (prev, { subscriptionData }) => {
        const change = subscriptionData.data?.accountingTrRecordsListChanged;
        const current = prev?.accTrRecordsMain;

        if (!change || !canApplyPush(current, change.hasMore)) {
          return prev;
        }

        return {
          ...prev,
          accTrRecordsMain: applyListChange(current, change),
        };
      },
    });
  }, [canApplyPush, subscribeToMore, subscriptionFilterKey]);

  const {
    list: trRecords,
    totalCount,
    pageInfo,
  } = data?.accTrRecordsMain || {};

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
            accTrRecordsMain: mergeGraphqlCursorData({
              direction,
              fetchMoreResult: fetchMoreResult.accTrRecordsMain,
              prevResult: prev.accTrRecordsMain,
            }),
          });
        },
      }),
    );
  };
  return {
    loading: loading && !queryData,
    trRecords,
    totalCount,
    error,
    handleFetchMore,
    pageInfo: toCursorPageInfo(pageInfo),
  };
};
