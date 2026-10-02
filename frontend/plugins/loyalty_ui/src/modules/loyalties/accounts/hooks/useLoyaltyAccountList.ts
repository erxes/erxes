import { useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  mergeCursorData,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useCallback, useEffect, useMemo } from 'react';
import { LOYALTY_ACCOUNT_CURSOR_SESSION_KEY } from '../constants/accountList';
import { LOYALTY_ACCOUNTS } from '../graphql';
import { loyaltyAccountTotalCountAtom } from '../states/accountCounts';
import { ILoyaltyAccount } from '../types';
import { useLoyaltyAccountFilters } from './useLoyaltyAccountFilters';

const ACCOUNTS_PER_PAGE = 50;

type TLoyaltyAccountsResponse = {
  loyaltyAccounts: {
    list: ILoyaltyAccount[];
    totalCount: number;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string | null;
      endCursor?: string | null;
    };
  };
};

export const useLoyaltyAccountList = () => {
  const setTotalCount = useSetAtom(loyaltyAccountTotalCountAtom);
  const filters = useLoyaltyAccountFilters();
  const variables = useMemo(
    () => ({ ...filters, limit: ACCOUNTS_PER_PAGE }),
    [filters],
  );
  const { cursor } = useRecordTableCursor({
    sessionKey: LOYALTY_ACCOUNT_CURSOR_SESSION_KEY,
  });

  const { data, loading, fetchMore } = useQuery<TLoyaltyAccountsResponse>(
    LOYALTY_ACCOUNTS,
    {
      variables: { ...variables, cursor },
      notifyOnNetworkStatusChange: true,
    },
  );

  const list = useMemo(
    () => data?.loyaltyAccounts?.list || [],
    [data?.loyaltyAccounts?.list],
  );
  const pageInfo = data?.loyaltyAccounts?.pageInfo;
  const totalCount = data?.loyaltyAccounts?.totalCount;

  const handleFetchMore = useCallback(
    ({ direction }: { direction: EnumCursorDirection }) => {
      if (!validateFetchMore({ direction, pageInfo })) {
        return;
      }

      fetchMore({
        variables: {
          ...variables,
          cursor:
            direction === EnumCursorDirection.FORWARD
              ? pageInfo?.endCursor
              : pageInfo?.startCursor,
          direction,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult?.loyaltyAccounts) {
            return prev;
          }

          return {
            loyaltyAccounts: {
              ...mergeCursorData({
                direction,
                fetchMoreResult: fetchMoreResult.loyaltyAccounts,
                prevResult: prev.loyaltyAccounts,
              }),
              totalCount:
                fetchMoreResult.loyaltyAccounts.totalCount ??
                prev.loyaltyAccounts.totalCount,
            },
          };
        },
      });
    },
    [fetchMore, pageInfo, variables],
  );

  useEffect(() => {
    setTotalCount(totalCount ?? null);
  }, [setTotalCount, totalCount]);

  return { list, loading, pageInfo, handleFetchMore };
};
