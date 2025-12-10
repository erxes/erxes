import { PageHeader } from 'ui-modules';
import { ByDateBreadcrumb } from '@/put-response/put-responses-by-date/components/ByDateBreadcrumb';

export const ByDateHeader = () => {
  return (
    <PageHeader>
      <PageHeader.Start>
        <ByDateBreadcrumb />
      </PageHeader.Start>
    </PageHeader>
  );
};
