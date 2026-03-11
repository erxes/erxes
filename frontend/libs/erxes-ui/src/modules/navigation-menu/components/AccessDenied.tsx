import { IconLock } from '@tabler/icons-react';

interface AccessDeniedProps {
  module?: string;
}

export const AccessDenied = ({ module }: AccessDeniedProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
      <IconLock className="w-12 h-12 text-muted-foreground" />
      <h2 className="text-lg font-semibold">Access Denied</h2>
      <p className="text-muted-foreground">
        You do not have permission to access
        {module ? (
          <>
            {' '}
            the <span className="capitalize font-medium">{module}</span> module
          </>
        ) : (
          ' this page'
        )}
        . Please contact your administrator.
      </p>
    </div>
  );
};
