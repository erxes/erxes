import { OperationVariables, useQuery } from '@apollo/client';
import { queries } from '@/settings/permission/graphql';

export const PERMISSIONS_PER_PAGE = 30;

const usePermissions = (options: OperationVariables) => {
  const { data, loading, fetchMore, error } = useQuery(
    queries.GET_PERMISSIONS,
    {
      ...options,
      variables: {
        perPage: PERMISSIONS_PER_PAGE,
        ...options.variables,
      },
      onError(error) {
        console.error('An error occured on fetch', error.message);
      },
    },
  );
  const { permissionsTotalCount: totalCount, permissions } = data || {};

  const handleFetchMore = () =>
    totalCount > permissions?.length &&
    fetchMore({
      variables: {
        page: Math.ceil(permissions.length / PERMISSIONS_PER_PAGE) + 1,
        perPage: PERMISSIONS_PER_PAGE,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          permissions: [
            ...(prev.permissions || []),
            ...fetchMoreResult.permissions,
          ],
        });
      },
    });

  return {
    permissions,
    loading,
    totalCount,
    handleFetchMore,
    error,
  };
};

const usePermissionActions = () => {
  return {};
};

const usePermissionModules = () => {
  return {};
};

export { usePermissions, usePermissionActions, usePermissionModules };
