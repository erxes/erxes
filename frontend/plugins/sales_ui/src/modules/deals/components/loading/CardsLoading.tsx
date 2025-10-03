import { Skeleton } from 'erxes-ui';

export const CardsLoading = () => {
  return (
    <div className="flex flex-col w-full p-2">
      <Skeleton className="w-full h-28 mb-2 bg-white" />
      <Skeleton className="w-full h-28 mb-2 bg-white" />
      <Skeleton className="w-full h-28 mb-2 bg-white" />
      <Skeleton className="w-full h-28 mb-2 bg-white" />
      <Skeleton className="w-full h-28 mb-2 bg-white" />
    </div>
  );
};
