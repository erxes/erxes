import { Skeleton } from 'erxes-ui';

export const DocumentEditorSkeleton = () => {
  return (
    <div className="h-full overflow-auto bg-background">
      <div className="flex min-h-full w-full flex-col">
        <div className="px-8 pb-3 pt-10">
          <Skeleton className="h-12 w-3/4" />
        </div>
        <div className="space-y-3 px-8">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
};
