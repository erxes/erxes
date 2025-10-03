import { Skeleton } from 'erxes-ui';

export const LeftSidebarLoading = () => {
  return (
    <div className="flex h-full w-[--sidebar-width] flex-col bg-sidebar border-r flex-none p-4">
      <Skeleton className="w-full h-8 mb-2" />
      <Skeleton className="w-full h-8 mb-2" />
      <Skeleton className="w-full h-8 mb-2" />
      <Skeleton className="w-full h-8 mb-2" />
      <Skeleton className="w-full h-8 mb-2" />
      <Skeleton className="w-full h-8 mb-2" />
    </div>
  );
};
