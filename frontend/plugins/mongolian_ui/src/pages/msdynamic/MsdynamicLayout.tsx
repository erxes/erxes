import { Outlet } from 'react-router-dom';
import { PageContainer } from 'erxes-ui';
import { MSDynamicSidebar } from '~/modules/msdynamic/components/MSDynamicSidebar';
import MsdynamicTopNav from '~/modules/msdynamic/components/MsdynamicTopNav';

const MsdynamicLayout = () => {
  return (
    <PageContainer className="flex-row">
      <MSDynamicSidebar />
      <div className="flex min-w-0 flex-auto flex-col overflow-hidden">
        <MsdynamicTopNav />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Outlet />
        </div>
      </div>
    </PageContainer>
  );
};

export default MsdynamicLayout;
