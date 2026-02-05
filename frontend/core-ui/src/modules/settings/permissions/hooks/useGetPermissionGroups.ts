import { useQuery } from '@apollo/client';
import {
  GET_PERMISSION_DEFAULT_GROUPS,
  GET_PERMISSION_GROUPS,
} from '@/settings/permissions/graphql/permissionGroupQueries';

import {
  IDefaultPermissionGroup,
  IPermissionGroup,
} from '@/settings/permissions/types';

export const useGetPermissionDefaultGroups = () => {
  const { data, loading, error } = useQuery<{
    permissionDefaultGroups: IDefaultPermissionGroup[];
  }>(GET_PERMISSION_DEFAULT_GROUPS);

  return {
    defaultGroups: data?.permissionDefaultGroups || [],
    loading,
    error,
  };
};

export const useGetPermissionGroups = () => {
  const { data, loading, error } = useQuery<{
    permissionGroups: IPermissionGroup[];
  }>(GET_PERMISSION_GROUPS);

  return {
    permissionGroups: data?.permissionGroups || [],
    loading,
    error,
  };
};
