import { Outlet } from 'react-router-dom';
import { PageContainer } from 'erxes-ui';
import { PutResponseSidebar } from '~/modules/ebarimt/put-response/components/PutResponseSidebar';
import { PutResponseTopNav } from '~/modules/ebarimt/put-response/components/PutResponseTopNav';

export const PutResponseLayout = () => {
  return (
    <PageContainer>
      <PutResponseTopNav />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <PutResponseSidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Outlet />
        </div>
      </div>
    </PageContainer>
  );
};
