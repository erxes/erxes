import { PageHeader } from 'ui-modules';
import { PutResponseBreadcrumb } from '~/modules/ebarimt/put-response/components/PutResponseBreadcrumb';

export const PutResponseTopNav = () => {
  return (
    <PageHeader>
      <PageHeader.Start>
        <PutResponseBreadcrumb />
      </PageHeader.Start>
    </PageHeader>
  );
};
