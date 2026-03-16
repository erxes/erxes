import { useQuery } from '@apollo/client';
import { CURRENT_USER_PERMISSIONS } from '../graphql';
import { useCallback, useMemo } from 'react';
import type { PermissionScope } from 'erxes-ui';

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

  // Build an indexed Set of all actions for O(1) lookup
  const actionsSet = useMemo(() => {
    const set = new Set<string>();
    for (const p of permissions) {
      for (const a of p.actions) {
        set.add(a);
      }
    }
    return set;
  }, [permissions]);

  // Build module -> highest scope map
  const scopeMap = useMemo(() => {
    const map = new Map<string, PermissionScope>();
    const priority: Record<string, number> = { own: 1, group: 2, all: 3 };

    for (const p of permissions) {
      const scope = p.scope as PermissionScope;
      const current = map.get(p.module);
      if (!current || (priority[scope] || 0) > (priority[current] || 0)) {
        map.set(p.module, scope);
      }
    }
    return map;
  }, [permissions]);

  /**
   * Check if user has a specific action permission.
   * e.g. canAction('taskCreate'), canAction('taskRemove')
   */
  const canAction = useCallback(
    (action: string): boolean => {
      if (loading || !permissions.length) return false;
      if (isOwner) return true;
      return actionsSet.has(action);
    },
    [loading, permissions.length, isOwner, actionsSet],
  );

  /**
   * Get the scope for a given module.
   * Returns null if the user has no access.
   */
  const getScope = useCallback(
    (module: string): PermissionScope | null => {
      if (loading || !permissions.length) return null;
      if (isOwner) return 'all';

      // Try exact, then singular
      const variants = [module];
      if (module.endsWith('s')) variants.push(module.slice(0, -1));

      for (const v of variants) {
        const scope = scopeMap.get(v);
        if (scope) return scope;
      }
      return null;
    },
    [loading, permissions.length, isOwner, scopeMap],
  );

  /**
   * Module-level check (backward compatible).
   * Returns true if user has any read access to the module.
   */
  const can = useCallback(
    (name: string): boolean => {
      if (loading || !permissions.length) return false;
      if (isOwner) return true;

      const variants = [name];
      if (name.endsWith('s')) {
        variants.push(name.slice(0, -1));
      }

      // Action-level: exact match (e.g. 'taskUpdate', 'contactsDelete')
      if (actionsSet.has(name)) {
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
    [permissions, loading, isOwner, actionsSet],
  );

  return { can, canAction, getScope, permissions, loading, error };
};
