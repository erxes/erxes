import { PageHeader } from 'ui-modules';
import { PutResponseBreadcrumb } from '@/put-response/components/PutResponseBreadcrumb';

export const PutResponseHeader = () => {
  return (
    <PageHeader>
      <PageHeader.Start>
        <PutResponseBreadcrumb />
      </PageHeader.Start>
    </PageHeader>
  );
};
