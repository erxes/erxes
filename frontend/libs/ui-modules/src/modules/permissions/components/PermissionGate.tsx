import { usePermissionCheck } from '../hooks/usePermissionCheck';

interface PermissionGateProps {
  action?: string;
  actions?: string[];
  module?: string;
  plugin?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const Can = ({
  action,
  actions,
  module,
  plugin,
  fallback = null,
  children,
}: PermissionGateProps) => {
  const {
    isLoaded,
    hasActionPermission,
    hasModulePermission,
    hasPluginPermission,
  } = usePermissionCheck();

  if (!isLoaded) return null;

  if (plugin && !hasPluginPermission(plugin)) {
    return <>{fallback}</>;
  }

  if (module && !hasModulePermission(module)) {
    return <>{fallback}</>;
  }

  if (action && !hasActionPermission(action)) {
    return <>{fallback}</>;
  }

  if (actions && actions.length > 0) {
    const hasAny = actions.some((a) => hasActionPermission(a));
    if (!hasAny) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};
