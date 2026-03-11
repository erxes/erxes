import { useQuery } from '@apollo/client';
import { CURRENT_USER_PERMISSIONS } from '../graphql';
import { useCallback, useMemo } from 'react';

export interface ICurrentUserPermission {
  plugin?: string;
  module: string;
  actions: string[];
  scope: string;
}

interface CurrentUserPermissionsData {
  currentUserPermissions: ICurrentUserPermission[];
}

export const useCurrentUserPermissions = () => {
  const { data, error, loading } = useQuery<CurrentUserPermissionsData>(CURRENT_USER_PERMISSIONS);

  const permissions = useMemo(
    () => data?.currentUserPermissions ?? [],
    [data?.currentUserPermissions],
  );

  const isOwner = useMemo(
    () => permissions.some((p) => p.module === '*' && p.actions.includes('*')),
    [permissions],
  );

  const can = useCallback(
    (name: string): boolean => {
      if (loading || !permissions.length) return false;
      
      if (isOwner) return true;

      // Try both the name and its singular form (e.g. 'tasks' → 'task')
      const variants = [name];
      
      if (name.endsWith('s')) {
        variants.push(name.slice(0, -1));
      }

      // Action-level: exact match (e.g. 'taskUpdate', 'contactsDelete')
      if (permissions.some((p) => p.actions.includes(name))) {
        return true;
      }

      // Module-level: has any read action in module
      if (
        permissions.some(
          (p) =>
            variants.includes(p.module) &&
            p.actions.some((a) => a.toLowerCase().includes('read')),
        )
      ) {
        return true;
      }

      // Plugin-level: has any read action in plugin
      if (
        permissions.some(
          (p) =>
            variants.includes(p.plugin || '') &&
            p.actions.some((a) => a.toLowerCase().includes('read')),
        )
      ) {
        return true;
      }

      return false;
    },
    [permissions, loading, isOwner],
  );

  return { can, permissions, loading, error };
};
