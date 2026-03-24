import { Suspense } from 'react';
import { FrontlineReportsList } from './FrontlineReportsList';
import { Skeleton } from 'erxes-ui';

export const ReportsView = () => {
  return (
    <Suspense fallback={<ReportsViewSkeleton />}>
      <div className="flex flex-col overflow-hidden h-full relative">
        <FrontlineReportsList />
      </div>
    </Suspense>
  );
};

export const ReportsViewSkeleton = () => {
  return (
    <div className="relative size-full overflow-hidden flex">
      <div className="flex flex-col overflow-hidden h-full relative m-3 gap-3 w-full">
        <div className="grid grid-cols-4 gap-4 w-full">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-19 w-full col-span-1" />
          ))}
        </div>
        <div className="grid grid-cols-12 gap-3 p-1 w-full">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-32 w-full col-span-6 aspect-video"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
