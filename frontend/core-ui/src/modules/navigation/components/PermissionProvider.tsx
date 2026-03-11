import { PermissionContext } from 'erxes-ui';
import { useCurrentUserPermissions } from 'ui-modules';

export const PermissionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { can } = useCurrentUserPermissions();

  return (
    <PermissionContext.Provider value={{ can }}>
      {children}
    </PermissionContext.Provider>
  );
};
