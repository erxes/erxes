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
import { PERMISSIONS_CURSOR_SESSION_KEY } from '~/modules/accountsSessionKeys';
import { PERMISSIONS_PER_PAGE } from '../constants/permissionDefaultValues';
import { GET_ACCOUNT_PERMISSIONS } from '../graphql/queries/getPermissions';
import { IPermission } from '../types/Permission';

export const usePermissionsVariables = (
  variables?: QueryHookOptions<ICursorListResponse<IPermission>>['variables'],
) => {
  const [queryParams] = useMultiQueryState<{
    searchValue?: string;
    code?: string;
    name?: string;
    categoryId?: string;
    currency?: string;
    kind?: string;
    journal?: string;
    status?: string;
    isTemp?: string;
    isOutBalance?: string;
    userId?: string;
    minLvl?: string;
    maxLvl?: string;
    reads?: string;
    writes?: string;
  }>([
    'searchValue',
    'code',
    'name',
    'categoryId',
    'currency',
    'kind',
    'journal',
    'status',
    'isTemp',
    'isOutBalance',
    'userId',
    'minLvl',
    'maxLvl',
    'reads',
    'writes',
  ]);

  const { cursor } = useRecordTableCursor({
    sessionKey: PERMISSIONS_CURSOR_SESSION_KEY,
  });

  const curVariables = Object.entries(queryParams).reduce(
    (acc, [key, value]) => {
      if (value === null || value === undefined || value === '') {
        return acc;
      }
      if (['isTemp', 'isOutBalance'].includes(key)) {
        acc[key] = value !== 'False' && value !== 'false';
      } else if (['minLvl', 'maxLvl'].includes(key)) {
        const n = Number(value);
        if (!Number.isNaN(n)) acc[key] = n;
      } else if (['reads', 'writes'].includes(key)) {
        acc[key] = String(value).split(',').filter(Boolean);
      } else {
        acc[key] = value + '';
      }
      return acc;
    },
    {} as Record<string, unknown>,
  );

  return {
    limit: PERMISSIONS_PER_PAGE,
    orderBy: {
      code: 1,
    },
    cursor,
    ...variables,
    ...curVariables,
  };
};

export const usePermissionsMain = (options?: QueryHookOptions) => {
  const variables = usePermissionsVariables(options?.variables);
  const { data, loading, fetchMore } = useQuery<{
    accountPermissions: {
      list: IPermission[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>(GET_ACCOUNT_PERMISSIONS, {
    notifyOnNetworkStatusChange: true,
    ...options,
    variables: {
      ...options?.variables,
      ...variables,
    },
  });

  const {
    list: permissionsMain,
    totalCount,
    pageInfo,
  } = data?.accountPermissions || {};

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
        limit: PERMISSIONS_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        const merged = mergeCursorData({
          direction,
          fetchMoreResult: fetchMoreResult.accountPermissions,
          prevResult: prev.accountPermissions,
        });
        return {
          ...prev,
          accountPermissions: {
            ...prev.accountPermissions,
            ...merged,
          },
        };
      },
    });
  };

  return {
    loading,
    permissionsMain,
    totalCount,
    handleFetchMore,
    pageInfo,
  };
};
