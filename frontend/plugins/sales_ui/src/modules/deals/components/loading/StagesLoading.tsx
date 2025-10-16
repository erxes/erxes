import { Skeleton } from 'erxes-ui';

export const StagesLoading = () => {
  return (
    <div className="flex w-full h-full gap-4 p-5">
      <Skeleton className="min-w-80 h-full rounded-md shrink-0" />
      <Skeleton className="min-w-80 h-full rounded-md shrink-0" />
      <Skeleton className="min-w-80 h-full rounded-md shrink-0" />
      <Skeleton className="min-w-80 h-full rounded-md shrink-0" />
      <Skeleton className="min-w-80 h-full rounded-md shrink-0" />
    </div>
  );
};
