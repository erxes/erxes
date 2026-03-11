import { useQuery } from '@apollo/client';
import { CURRENT_USER_PERMISSIONS } from '../graphql';
import { useCallback, useMemo } from 'react';

export interface ICurrentUserPermission {
  plugin?: string;
  module: string;
  actions: string[];
  scope: string;
}

export const useCurrentUserPermissions = () => {
  const { data, error, loading } = useQuery<{
    currentUserPermissions: ICurrentUserPermission[];
  }>(CURRENT_USER_PERMISSIONS);

  const currentUserPermissions = useMemo(
    () => data?.currentUserPermissions ?? [],
    [data?.currentUserPermissions],
  );

  const hasPermission = useCallback(
    (action: string): boolean => {
      if (!currentUserPermissions.length) return false;

      // Owner has all permissions
      if (
        currentUserPermissions.some(
          (p) => p.module === '*' && p.actions.includes('*'),
        )
      ) {
        return true;
      }

      return currentUserPermissions.some((p) => p.actions.includes(action));
    },
    [currentUserPermissions],
  );

  const hasAnyReadPermissionForPlugin = useCallback(
    (pluginName: string): boolean => {
      if (!currentUserPermissions.length) return false;

      // Owner has all permissions
      if (
        currentUserPermissions.some(
          (p) => p.module === '*' && p.actions.includes('*'),
        )
      ) {
        return true;
      }

      return currentUserPermissions.some(
        (p) =>
          p.plugin === pluginName &&
          p.actions.some((a) => a.toLowerCase().includes('read')),
      );
    },
    [currentUserPermissions],
  );

  return {
    currentUserPermissions,
    hasPermission,
    hasAnyReadPermissionForPlugin,
    error,
    loading,
  };
};
