import { IconLock } from '@tabler/icons-react';
import { usePermissionContext } from 'erxes-ui';

interface CorePermissionGuardProps {
  module: string;
  children: React.ReactNode;
}

export const CorePermissionGuard = ({
  module,
  children,
}: CorePermissionGuardProps) => {
  const { canAccessModule } = usePermissionContext();

  if (!canAccessModule(module)) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <IconLock className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">
          You do not have permission to access the{' '}
          <span className="capitalize font-medium">{module}</span> module.
          Please contact your administrator.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
