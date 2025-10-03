import { Skeleton } from 'erxes-ui';

export function GeneralSettingsSkeleton() {
  return (
    <div className="py-1 flex flex-col space-y-3">
      <Skeleton className="w-1/5 h-3.5" />
      <Skeleton className="w-full h-8" />
      <Skeleton className="w-1/5 h-3.5" />
      <Skeleton className="w-full h-9" />
      <Skeleton className="w-1/4 ml-auto h-7" />
    </div>
  );
}
