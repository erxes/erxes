import { useQuery } from '@apollo/client';
import { GET_PERMISSION_MODULES } from '@/settings/permissions/graphql/permissionGroupQueries';
import {
  IPermissionModule,
  IPermissionModulesByPlugin,
} from '@/settings/permissions/types';

export const useGetPermissionModules = () => {
  const { data, loading, error } = useQuery<{
    permissionModules: IPermissionModulesByPlugin[];
  }>(GET_PERMISSION_MODULES);

  const permissionModulesByPlugin = data?.permissionModules || [];
  const permissionModules: IPermissionModule[] =
    permissionModulesByPlugin.flatMap((g) => g.modules);

  return {
    permissionModulesByPlugin,
    permissionModules,
    loading,
    error,
  };
};
