import { Outlet } from 'react-router-dom';
import { PageContainer } from 'erxes-ui';
import { MSDynamicSidebar } from '~/modules/msdynamic/components/MSDynamicSidebar';
import MsdynamicTopNav from '~/modules/msdynamic/components/MsdynamicTopNav';

const MsdynamicLayout = () => {
  return (
    <PageContainer>
      <MsdynamicTopNav />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <MSDynamicSidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Outlet />
        </div>
      </div>
    </PageContainer>
  );
};

export default MsdynamicLayout;
