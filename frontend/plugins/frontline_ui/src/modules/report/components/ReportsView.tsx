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
      <div className="flex flex-col overflow-hidden h-full relative m-3 gap-3">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-12 gap-3 p-1">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
};
