import { PermissionContext } from 'erxes-ui';
import { useCurrentUserPermissions } from 'ui-modules';
import { useMemo } from 'react';

export const PermissionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { can, canAction, getScope, loading } = useCurrentUserPermissions();

  const value = useMemo(
    () => ({ can, canAction, getScope, loading }),
    [can, canAction, getScope, loading],
  );

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};
