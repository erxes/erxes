import { Skeleton } from 'erxes-ui';

export const DocumentEditorSkeleton = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="px-9 py-4">
        <Skeleton className="h-14 w-3/4 mb-2" />
      </div>
      <div className="flex-1 px-9 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
};
