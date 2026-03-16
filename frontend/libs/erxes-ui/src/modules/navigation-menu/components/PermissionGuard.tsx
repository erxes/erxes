import { usePermissionContext } from '../contexts/PermissionContext';
import { AccessDenied } from './AccessDenied';

interface PermissionGuardProps {
  /** Module-level check (backward compatible) */
  module?: string;
  /** Action-level check, e.g. 'taskCreate' */
  action?: string;
  children: React.ReactNode;
  /** Optional custom fallback instead of AccessDenied */
  fallback?: React.ReactNode;
}

/**
 * Route/page-level permission guard. Shows AccessDenied when unauthorized.
 *
 * Usage:
 *   // Module-level (backward compatible)
 *   <PermissionGuard module="task">
 *     <TaskPage />
 *   </PermissionGuard>
 *
 *   // Action-level
 *   <PermissionGuard action="taskCreate">
 *     <CreateTaskPage />
 *   </PermissionGuard>
 */
export const PermissionGuard = ({
  module,
  action,
  children,
  fallback,
}: PermissionGuardProps) => {
  const { can, canAction } = usePermissionContext();

  let allowed = true;

  if (action) {
    allowed = canAction(action);
  } else if (module) {
    allowed = can(module);
  }

  if (!allowed) {
    if (fallback !== undefined) return fallback as React.ReactElement;
    return <AccessDenied module={module} />;
  }

  return children as React.ReactElement;
};
