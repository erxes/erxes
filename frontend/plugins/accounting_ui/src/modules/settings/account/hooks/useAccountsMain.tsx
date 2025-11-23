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
import { ACCOUNTS_CURSOR_SESSION_KEY } from '~/modules/accountsSessionKeys';
import { ACCOUNTS_PER_PAGE } from '../constants/accountDefaultValues';
import { GET_ACCOUNTS_MAIN } from '../graphql/queries/getAccounts';
import { IAccount } from '../types/Account';

export const useAccountsVariables = (
  variables?: QueryHookOptions<ICursorListResponse<IAccount>>['variables'],
) => {
  const [queryParams] = useMultiQueryState<{
    searchValue?: string;
    code?: string;
    name?: string;
    categoryId?: string;
    currency?: string
    kind?: string;
    journal?: string;
    status?: string;
    isTemp?: string;
    isOutBalance?: string;
  }>([
    'searchValue', 'code', 'name', 'categoryId', 'currency',
    'kind', 'journal', 'status', 'isTemp', 'isOutBalance'
  ]);

  const { cursor } = useRecordTableCursor({
    sessionKey: ACCOUNTS_CURSOR_SESSION_KEY,
  });

  const curVariables = Object.entries(queryParams).reduce((acc, [key, value]) => {
    if (value) {
      if (['isTemp', 'isOutBalance'].includes(key)) {
        acc[key] = 'False' === value ? false : true;
      } else {
        acc[key] = value + '';
      }
    }
    return acc;
  }, {} as Record<string, string | boolean>);

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
