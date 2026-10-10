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
import { useQuery } from '@apollo/client';
import { useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { currentUserState, IUser } from 'ui-modules';
import { EnumCursorDirection, validateFetchMore } from 'erxes-ui';
import { TRANSACTIONS_QUERY } from '../graphql/transactionQueries';
import { ACCOUNTING_TRANSACTION_CHANGED } from '../graphql/transactionSubscriptions';
import { ACC_TRS__PER_PAGE } from '../types/constants';

import { useTransactionsVariables } from './useTransactionVars';

export const useTransactions = (
  options?: QueryHookOptions<
    AccountingAccTransactionsQuery,
    AccountingAccTransactionsQueryVariables
  >,
) => {
  const variables = useTransactionsVariables(options?.variables);
  const refetchTimer = useRef<ReturnType<typeof setTimeout>>();
  const currentUser = useAtomValue(currentUserState) as IUser;
  const subscriptionFilterKey = JSON.stringify(variables);

  const {
    data: queryData,
    loading,
    error,
    fetchMore,
    refetch,
    subscribeToMore,
  } = useQuery(TRANSACTIONS_QUERY, {
    ...options,
    variables: {
      ...options?.variables,
      ...variables,
    },
  });
  const data = toGraphqlView(queryData);

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: ACCOUNTING_TRANSACTION_CHANGED,
      variables: {
        parentId: undefined,
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (subscriptionData.data) {
          if (refetchTimer.current) {
            clearTimeout(refetchTimer.current);
          }

          refetchTimer.current = setTimeout(() => {
            refetch();
          }, 500);
        }

        return prev;
      },
    });

    return () => {
      if (refetchTimer.current) {
        clearTimeout(refetchTimer.current);
      }

      unsubscribe();
    };
  }, [
    currentUser?._id,
    refetch,
    subscribeToMore,
    subscriptionFilterKey,
  ]);

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
    });
  };

  return {
    loading,
    transactions,
    totalCount,
    error,
    handleFetchMore,
    pageInfo: toCursorPageInfo(pageInfo),
  };
};
