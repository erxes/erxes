import { usePermissionContext } from '../contexts/PermissionContext';

interface CanProps {
  action?: string;
  module?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const Can = ({ action, module, children, fallback = null }: CanProps) => {
  const { can, canAction } = usePermissionContext();

  let allowed = true;

  if (action) {
    allowed = canAction(action);
  } else if (module) {
    allowed = can(module);
  }

  if (!allowed) {
    return fallback as React.ReactElement | null;
  }

  return children as React.ReactElement;
};
