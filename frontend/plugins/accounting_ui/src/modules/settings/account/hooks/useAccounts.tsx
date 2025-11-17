import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  ICursorListResponse,
  IRecordTableCursorPageInfo,
  mergeCursorData,
  useMultiQueryState,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { GET_ACCOUNTS, GET_ACCOUNTS_MAIN, GET_ASSIGNED_ACCOUNTS } from '../graphql/queries/getAccounts';
import { IAccount } from '../types/Account';
import { ACCOUNTS_CURSOR_SESSION_KEY } from '../../../accountsSessionKeys';

export const ACCOUNTS_PER_PAGE = 30;

export const useAccountsVariables = (
  variables?: QueryHookOptions<ICursorListResponse<IAccount>>['variables'],
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
    sessionKey: ACCOUNTS_CURSOR_SESSION_KEY,
  });

  const curVariables = Object.entries(queryParams).reduce((acc, [key, value]) => {
    if (value) {
      acc[key] = value + '';
    } return acc;
  }, {} as Record<string, string>);

  return {
    limit: ACCOUNTS_PER_PAGE,
    orderBy: {
      code: 1
    },
    cursor,
    ...variables,
    ...curVariables
  };
};

export const useAccountsMain = (options?: QueryHookOptions) => {
  const variables = useAccountsVariables(options?.variables);
  const { data, loading, fetchMore } = useQuery<{
    accountsMain: {
      list: IAccount[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>(GET_ACCOUNTS_MAIN, {
    ...options,
    variables: {
      ...options?.variables,
      ...variables
    },
  });

  const { list: accountsMain, totalCount, pageInfo } = data?.accountsMain || {};

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
        limit: ACCOUNTS_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          accountsMain: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.accountsMain,
            prevResult: prev.accountsMain,
          }),
        });
      },
    });
  };

  return {
    loading,
    accountsMain,
    totalCount,
    handleFetchMore,
    pageInfo,
  };
};

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
