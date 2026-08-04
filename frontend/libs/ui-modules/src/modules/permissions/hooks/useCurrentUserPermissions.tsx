import { useQuery } from '@apollo/client';
import { CURRENT_USER_PERMISSIONS } from '../graphql';

export interface ICurrentUserPermission {
  plugin: string;
  module: string;
  actions: string[];
  scope: string;
}

export interface ICurrentUserPermissionsResult {
  permissions: ICurrentUserPermission[];
  pluginsWithPermissions: string[];
}

export const useCurrentUserPermissions = () => {
  const { data, error, loading } = useQuery<{
    currentUserPermissions: ICurrentUserPermissionsResult;
  }>(CURRENT_USER_PERMISSIONS);
  return {
    currentUserPermissions: data?.currentUserPermissions?.permissions ?? [],
    pluginsWithPermissions: data?.currentUserPermissions?.pluginsWithPermissions ?? [],
    error,
    loading,
  };
};
