import { usePermissionCheck } from 'ui-modules';
import { NoAccessPage } from '~/pages/no-access/NoAccessPage';

interface PermissionRouteGuardProps {
  plugin?: string;
  module?: string;
  action?: string;
  children: React.ReactNode;
}

export const PermissionRouteGuard = ({
  plugin,
  module,
  action,
  children,
}: PermissionRouteGuardProps) => {
  const {
    isLoaded,
    isWildcard,
    hasPluginPermission,
    hasModulePermission,
    hasActionPermission,
  } = usePermissionCheck();

  if (!isLoaded) return null;
  if (isWildcard) return <>{children}</>;

  if (plugin && !hasPluginPermission(plugin)) {
    return <NoAccessPage />;
  }

  if (module && !hasModulePermission(module)) {
    return <NoAccessPage />;
  }

  if (action && !hasActionPermission(action)) {
    return <NoAccessPage />;
  }

  return <>{children}</>;
};
