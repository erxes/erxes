import { Skeleton } from 'erxes-ui';

export const StagesLoading = () => {
  return (
    <div className="flex w-full h-full gap-3 p-3">
      <Skeleton className="w-72 h-full rounded-md shrink-0" />
      <Skeleton className="w-72 h-full rounded-md shrink-0" />
      <Skeleton className="w-72 h-full rounded-md shrink-0" />
      <Skeleton className="w-72 h-full rounded-md shrink-0" />
      <Skeleton className="w-72 h-full rounded-md shrink-0" />
    </div>
  );
};
