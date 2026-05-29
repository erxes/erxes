import { Skeleton } from 'erxes-ui';

export const ManagePropertiesConfigFormSkeleton = () => {
  return (
    <div className="w-[500px] p-4 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-full" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <div className="border rounded p-4 space-y-4">
          <div className="flex gap-4">
            <div className="w-3/5 space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="w-2/5 space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
};
