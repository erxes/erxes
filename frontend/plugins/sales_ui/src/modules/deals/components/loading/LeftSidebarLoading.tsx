import { Sidebar, Skeleton } from 'erxes-ui';

export const LeftSidebarLoading = () => {
  return (
    <Sidebar.Panel className="flex-none border-r">
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <Skeleton className="h-8 flex-1" />
          <Sidebar.PanelTrigger />
        </div>
        <Skeleton className="w-full h-8 mb-2" />
        <Skeleton className="w-full h-8 mb-2" />
        <Skeleton className="w-full h-8 mb-2" />
        <Skeleton className="w-full h-8 mb-2" />
        <Skeleton className="w-full h-8 mb-2" />
      </div>
    </Sidebar.Panel>
  );
};
