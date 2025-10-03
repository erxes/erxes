import { useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  mergeCursorData,
  useMultiQueryState,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { PERMISSION_CURSOR_SESSION_KEY } from 'ui-modules/modules/permissions/constants/permissionCursorSessionKey';
import {
  GET_PERMISSION_ACTIONS,
  GET_PERMISSION_MODULES,
  GET_PERMISSIONS,
} from 'ui-modules/modules/permissions/graphql';
import {
  IPermissionAction,
  IPermissionModule,
  IPermissionResponse,
  IQueryPermissionsHookOptions,
} from 'ui-modules/modules/permissions/types/permission';

const PERMISSIONS_PER_PAGE = 30;

export const usePermissions = (options?: IQueryPermissionsHookOptions) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: PERMISSION_CURSOR_SESSION_KEY,
  });
  const [{ groupId }] = useMultiQueryState<{ groupId: string }>(['groupId']);
  const { data, error, loading, fetchMore } = useQuery<IPermissionResponse>(
    GET_PERMISSIONS,
    {
      ...options,
      variables: {
        limit: PERMISSIONS_PER_PAGE,
        groupId: groupId ?? undefined,
        cursor,
        ...options?.variables,
      },
    },
  );
  const { list = [], totalCount = 0, pageInfo } = data?.permissions || {};

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
        ...options?.variables,
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: PERMISSIONS_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          permissions: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.permissions,
            prevResult: prev.permissions,
          }),
        });
      },
    });
  };
  return {
    permissions: list,
    loading,
    handleFetchMore,
    error,
    totalCount,
    pageInfo,
  };
};

export const usePermissionsActions = () => {
  const { data, error, loading, fetchMore } = useQuery<{
    permissionActions: IPermissionAction[];
  }>(GET_PERMISSION_ACTIONS);

  return {
    actions: data?.permissionActions ?? [],
    loading,
    error,
    fetchMore,
  };
};

export const usePermissionsModules = () => {
  const { data, error, loading, fetchMore } = useQuery<{
    permissionModules: IPermissionModule[];
  }>(GET_PERMISSION_MODULES);

  return {
    modules: data?.permissionModules ?? [],
    loading,
    error,
    fetchMore,
  };
};
