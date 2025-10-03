import { Skeleton } from 'erxes-ui';

export const PipelineListLoading = () => {
  return (
    <div className="flex flex-col w-full p-4">
      <Skeleton className="w-full h-8 mb-2" />
      <Skeleton className="w-full h-8 mb-2" />
      <Skeleton className="w-full h-8 mb-2" />
      <Skeleton className="w-full h-8 mb-2" />
      <Skeleton className="w-full h-8 mb-2" />
      <Skeleton className="w-full h-8 mb-2" />
    </div>
  );
};
