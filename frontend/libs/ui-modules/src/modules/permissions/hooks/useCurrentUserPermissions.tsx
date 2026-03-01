import { useQuery } from '@apollo/client';
import { CURRENT_USER_PERMISSIONS } from '../graphql';

interface ICurrentUserPermission {
  module: string;
  actions: string[];
  scope: string;
}

export const useCurrentUserPermissions = () => {
  const { data, error, loading } = useQuery<{
    currentUserPermissions: ICurrentUserPermission[];
  }>(CURRENT_USER_PERMISSIONS);
  return {
    currentUserPermissions: data?.currentUserPermissions ?? [],
    error,
    loading,
  };
};
