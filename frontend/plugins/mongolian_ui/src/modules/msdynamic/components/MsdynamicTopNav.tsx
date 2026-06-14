import { PageHeader } from 'ui-modules';
import { MSDynamicBreadCrumb } from './MSDynamicBreadcrumb';

const MsdynamicTopNav = () => {
  return (
    <PageHeader>
      <PageHeader.Start>
        <MSDynamicBreadCrumb />
      </PageHeader.Start>
    </PageHeader>
  );
};

export default MsdynamicTopNav;
