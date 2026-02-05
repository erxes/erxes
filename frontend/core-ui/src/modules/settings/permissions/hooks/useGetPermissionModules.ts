import { useQuery } from '@apollo/client';
import { GET_PERMISSION_MODULES } from '@/settings/permissions/graphql/permissionGroupQueries';
import { IPermissionModule } from '@/settings/permissions/types';

export const useGetPermissionModules = () => {
  const { data, loading, error } = useQuery<{
    permissionModules: IPermissionModule[];
  }>(GET_PERMISSION_MODULES);

  return {
    permissionModules: data?.permissionModules || [],
    loading,
    error,
  };
};
