import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import {
  currentUserPermissionsState,
  isPermissionsLoadedState,
} from 'ui-modules/states/currentUserPermissionsState';
import { currentUserState } from 'ui-modules/states/currentUserState';

export const usePermissionCheck = () => {
  const permissions = useAtomValue(currentUserPermissionsState);
  const isLoaded = useAtomValue(isPermissionsLoadedState);
  const currentUser = useAtomValue(currentUserState);

  const isOwner = currentUser?.isOwner === true;

  const isWildcard = useMemo(() => {
    if (isOwner) return true;
    if (!permissions) return false;
    return permissions.some((p) => p.module === '*' && p.actions.includes('*'));
  }, [permissions, isOwner]);

  const hasPluginPermission = useMemo(() => {
    return (pluginName: string) => {
      if (isWildcard) return true;
      if (!permissions) return false;
      return permissions.some(
        (p) => p.plugin === pluginName && p.actions.length > 0,
      );
    };
  }, [permissions, isWildcard]);

  const hasModulePermission = useMemo(() => {
    return (moduleName: string) => {
      if (isWildcard) return true;
      if (!permissions) return false;
      return permissions.some(
        (p) => p.module === moduleName && p.actions.length > 0,
      );
    };
  }, [permissions, isWildcard]);

  const hasActionPermission = useMemo(() => {
    return (actionName: string) => {
      if (isWildcard) return true;
      if (!permissions) return false;
      return permissions.some((p) => p.actions.includes(actionName));
    };
  }, [permissions, isWildcard]);

  const getModuleActions = useMemo(() => {
    return (moduleName: string): string[] => {
      if (isWildcard) return ['*'];
      if (!permissions) return [];
      const perm = permissions.find((p) => p.module === moduleName);
      return perm?.actions ?? [];
    };
  }, [permissions, isWildcard]);

  const getModuleScope = useMemo(() => {
    return (moduleName: string): string => {
      if (isWildcard) return 'all';
      if (!permissions) return 'own';
      const perm = permissions.find((p) => p.module === moduleName);
      return perm?.scope ?? 'own';
    };
  }, [permissions, isWildcard]);

  return {
    isLoaded,
    isOwner,
    isWildcard,
    permissions,
    hasPluginPermission,
    hasModulePermission,
    hasActionPermission,
    getModuleActions,
    getModuleScope,
  };
};
