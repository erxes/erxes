import { PageHeader } from 'ui-modules';
import { ByDateBreadcrumb } from '@/put-responses-by-date/components/ByDateBreadcrumb';

export const ByDateHeader = () => {
  return (
    <PageHeader>
      <PageHeader.Start>
        <ByDateBreadcrumb />
      </PageHeader.Start>
    </PageHeader>
  );
};
