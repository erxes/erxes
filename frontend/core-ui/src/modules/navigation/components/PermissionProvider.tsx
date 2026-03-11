import { PermissionContext } from 'erxes-ui';
import { useCurrentUserPermissions } from 'ui-modules';
import { useCallback } from 'react';

export const PermissionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { currentUserPermissions, loading } = useCurrentUserPermissions();

  const canAccessModule = useCallback(
    (moduleName: string): boolean => {
      if (loading) return false;
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
          p.module === moduleName &&
          p.actions.some((a) => a.toLowerCase().includes('read')),
      );
    },
    [currentUserPermissions, loading],
  );

  return (
    <PermissionContext.Provider value={{ canAccessModule }}>
      {children}
    </PermissionContext.Provider>
  );
};
