import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  GET_PERMISSION_DEFAULT_GROUPS,
  GET_PERMISSION_GROUPS,
} from '@/settings/permissions/graphql/permissionGroupQueries';

import {
  IDefaultPermissionGroup,
  IPermissionGroup,
} from '@/settings/permissions/types';

export const useGetPermissionDefaultGroups = (
  options?: QueryHookOptions<{
    permissionDefaultGroups: IDefaultPermissionGroup[];
  }>,
) => {
  const { data, loading, error, refetch } = useQuery<{
    permissionDefaultGroups: IDefaultPermissionGroup[];
  }>(GET_PERMISSION_DEFAULT_GROUPS, options);

  return {
    defaultGroups: data?.permissionDefaultGroups || [],
    loading,
    error,
    refetch,
  };
};

export const useGetPermissionGroups = (
  options?: QueryHookOptions<{
    permissionGroups: IPermissionGroup[];
  }>,
) => {
  const { data, loading, error, refetch } = useQuery<{
    permissionGroups: IPermissionGroup[];
  }>(GET_PERMISSION_GROUPS, options);

  return {
    permissionGroups: data?.permissionGroups || [],
    loading,
    error,
    refetch,
  };
};
