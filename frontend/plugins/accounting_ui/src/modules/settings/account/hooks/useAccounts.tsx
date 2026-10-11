import type {
  AccountingAccountsQuery,
  AccountingAccountsQueryVariables,
  AccountingAssignedAccountsQuery,
  AccountingAssignedAccountsQueryVariables,
} from '~/gql/graphql';
import { toGraphqlView } from '@/utils/graphql';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { EnumCursorDirection } from 'erxes-ui';
import { ACCOUNTS_PER_PAGE } from '../constants/accountDefaultValues';
import {
  GET_ACCOUNTS,
  GET_ASSIGNED_ACCOUNTS,
} from '../graphql/queries/getAccounts';

export const useAccounts = (
  options?: QueryHookOptions<
    AccountingAccountsQuery,
    AccountingAccountsQueryVariables
  >,
) => {
  const {
    data: queryData,
    loading,
    fetchMore,
    error,
  } = useQuery(GET_ACCOUNTS, {
    ...options,
    variables: {
      limit: ACCOUNTS_PER_PAGE,
      ...options?.variables,
    },
  });
  const data = toGraphqlView(queryData);
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
        if (!fetchMoreResult?.accountsMain) return prev;
        return Object.assign({}, prev, {
          accountsMain: {
            list: [
              ...(prev.accountsMain?.list || []),
              ...(fetchMoreResult.accountsMain.list ?? []),
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
  options?: QueryHookOptions<
    AccountingAssignedAccountsQuery,
    AccountingAssignedAccountsQueryVariables
  >,
) => {
  const {
    data: queryData,
    loading,
    error,
  } = useQuery(GET_ASSIGNED_ACCOUNTS, options);
  const data = toGraphqlView(queryData);
  return { accounts: data?.accounts || [], loading, error };
};
