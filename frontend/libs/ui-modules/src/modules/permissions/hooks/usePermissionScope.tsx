import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import {
  currentUserPermissionsState,
  isPermissionsLoadedState,
} from 'ui-modules/states/currentUserPermissionsState';
import { currentUserState } from 'ui-modules/states/currentUserState';

export type PermissionScope = 'own' | 'group' | 'all';

export interface ScopeFilter {
  scope: PermissionScope;
  userId: string | undefined;
}

export const usePermissionScope = (moduleName: string): ScopeFilter => {
  const permissions = useAtomValue(currentUserPermissionsState);
  const isLoaded = useAtomValue(isPermissionsLoadedState);
  const currentUser = useAtomValue(currentUserState);

  return useMemo(() => {
    const userId = currentUser?._id;

    if (!isLoaded || !permissions) {
      return { scope: 'own' as PermissionScope, userId };
    }

    if (currentUser?.isOwner) {
      return { scope: 'all' as PermissionScope, userId };
    }

    const isWildcard = permissions.some(
      (p) => p.module === '*' && p.actions.includes('*'),
    );

    if (isWildcard) {
      return { scope: 'all' as PermissionScope, userId };
    }

    const perm = permissions.find((p) => p.module === moduleName);
    const scope = (perm?.scope ?? 'own') as PermissionScope;

    return { scope, userId };
  }, [permissions, isLoaded, currentUser, moduleName]);
};
