import { IconLock } from '@tabler/icons-react';

export const NoAccessPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
          <IconLock className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">Access Denied</h2>
        <p className="text-gray-500">
          You don't have permission to access this page. Contact your
          administrator to request access.
        </p>
      </div>
    </div>
  );
};
