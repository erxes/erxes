import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  ICursorListResponse,
} from 'erxes-ui';
import { ACCOUNTS_PER_PAGE } from '../constants/accountDefaultValues';
import { GET_ACCOUNTS, GET_ASSIGNED_ACCOUNTS } from '../graphql/queries/getAccounts';
import { IAccount } from '../types/Account';

export const useAccounts = (
  options?: QueryHookOptions<ICursorListResponse<IAccount>>,
) => {
  const { data, loading, fetchMore, error } = useQuery<
    ICursorListResponse<IAccount>
  >(GET_ACCOUNTS, {
    ...options,
    variables: {
      limit: ACCOUNTS_PER_PAGE,
      ...options?.variables,
    },
  });
  const { list = [], totalCount = 0, pageInfo } = data?.accountsMain || {};

  const handleFetchMore = () => {
    if (!pageInfo || totalCount <= list.length) return;
    fetchMore({
      variables: {
        ...options?.variables,
        cursor: pageInfo?.endCursor,
        direction: EnumCursorDirection.FORWARD,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          accountsMain: {
            list: [
              ...(prev.accountsMain?.list || []),
              ...fetchMoreResult.accountsMain.list,
            ],
            totalCount: fetchMoreResult.accountsMain.totalCount,
            pageInfo: fetchMoreResult.accountsMain.pageInfo,
          },
        });
      },
    });
  };
  return {
    accounts: list,
    loading,
    handleFetchMore,
    totalCount,
    error,
  };
};

export const useAccountsInline = (
  options?: QueryHookOptions<{ accounts: IAccount[] }>,
) => {
  const { data, loading, error } = useQuery<{ accounts: IAccount[] }>(
    GET_ASSIGNED_ACCOUNTS,
    options,
  );
  return { accounts: data?.accounts || [], loading, error };
};
