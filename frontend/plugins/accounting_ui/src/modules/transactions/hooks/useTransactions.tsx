import { OperationVariables, useQuery } from '@apollo/client';
import { useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { currentUserState, IUser } from 'ui-modules';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  mergeCursorData,
  validateFetchMore,
} from 'erxes-ui';
import { TRANSACTIONS_QUERY } from '../graphql/transactionQueries';
import { ACCOUNTING_TRANSACTION_CHANGED } from '../graphql/transactionSubscriptions';
import { ACC_TRS__PER_PAGE } from '../types/constants';
import { ITransaction } from '../types/Transaction';
import { useTransactionsVariables } from './useTransactionVars';

export const useTransactions = (options?: OperationVariables) => {
  const variables = useTransactionsVariables(options?.variables);
  const refetchTimer = useRef<ReturnType<typeof setTimeout>>();
  const currentUser = useAtomValue(currentUserState) as IUser;
  const subscriptionFilterKey = JSON.stringify(variables);

  const { data, loading, error, fetchMore, refetch, subscribeToMore } =
    useQuery<{
      accTransactionsMain: {
        list: ITransaction[];
        totalCount: number;
        pageInfo: IRecordTableCursorPageInfo;
      };
    }>(TRANSACTIONS_QUERY, {
      ...options,
      variables: {
        ...options?.variables,
        ...variables,
      },
    });

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: ACCOUNTING_TRANSACTION_CHANGED,
      variables: {
        filter: variables,
        userId: currentUser?._id,
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
    variables,
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
