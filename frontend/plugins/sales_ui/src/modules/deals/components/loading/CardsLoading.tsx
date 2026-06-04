import { Skeleton } from 'erxes-ui';

export const CardsLoading = () => {
  return (
    <div className="flex flex-col w-full">
      <Skeleton className="w-full h-28 mb-2 bg-background" />
      <Skeleton className="w-full h-28 mb-2 bg-background" />
      <Skeleton className="w-full h-28 mb-2 bg-background" />
      <Skeleton className="w-full h-28 mb-2 bg-background" />
      <Skeleton className="w-full h-28 mb-2 bg-background" />
    </div>
  );
};
