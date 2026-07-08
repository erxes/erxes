import { Outlet } from 'react-router-dom';
import { PageContainer } from 'erxes-ui';
import { SyncErkhetSidebar } from '~/modules/erkhet-sync/components/SyncErkhetSidebar';
import { SyncErkhetTopNav } from '~/modules/erkhet-sync/components/SyncErkhetTopNav';

export const SyncErkhetLayout = () => {
  return (
    <PageContainer>
      <SyncErkhetTopNav />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <SyncErkhetSidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Outlet />
        </div>
      </div>
    </PageContainer>
  );
};
