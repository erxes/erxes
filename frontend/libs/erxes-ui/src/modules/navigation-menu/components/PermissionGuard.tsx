import { usePermissionContext } from '../contexts/PermissionContext';
import { AccessDenied } from './AccessDenied';

interface PermissionGuardProps {
  module: string;
  children: React.ReactNode;
}

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
