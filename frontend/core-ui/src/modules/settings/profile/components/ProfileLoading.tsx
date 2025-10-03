import { Skeleton } from 'erxes-ui';

const ProfileLoading = () => {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-3 w-28" />
      <div className="flex gap-4">
        <Skeleton className="h-16 w-16" />
        <div className="flex-col gap-2 flex">
          <div className="flex gap-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-3 w-60" />
        </div>
      </div>
      <Skeleton className="h-3 w-10" />
      <Skeleton className="h-3 w-44" />
      <div className="grid grid-cols-2 gap-6 mt-0.5">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
      <Skeleton className="h-3 w-10" />
      <Skeleton className="h-3 w-44" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-3 w-96" />
      <Skeleton className="h-3 w-10" />
      <Skeleton className="h-3 w-40" />

      <div className="flex gap-1">
        <Skeleton className="h-6 w-9" />
        <Skeleton className="h-6 w-9" />
        <Skeleton className="h-6 w-9" />
        <Skeleton className="h-6 w-9" />
        <Skeleton className="h-6 w-9" />
        <Skeleton className="h-6 w-9" />
      </div>
    </div>
  );
};

export { ProfileLoading };
