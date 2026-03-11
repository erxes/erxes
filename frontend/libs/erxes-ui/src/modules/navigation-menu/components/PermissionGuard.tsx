import { usePermissionContext } from '../contexts/PermissionContext';
import { AccessDenied } from './AccessDenied';

interface PermissionGuardProps {
  /** Plugin, module, or action name to check */
  module: string;
  children: React.ReactNode;
}

/**
 * Route-level permission guard.
 *
 * <PermissionGuard module="contacts">...</PermissionGuard>
 * <PermissionGuard module="task">...</PermissionGuard>
 */
export const PermissionGuard = ({
  module,
  children,
}: PermissionGuardProps) => {
  const { can } = usePermissionContext();

  if (!can(module)) {
    return <AccessDenied module={module} />;
  }

  return children as React.ReactElement;
};
