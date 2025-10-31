import { PageHeader } from 'ui-modules';
import { ByDateBreadcrumb } from '@/by-date/components/ByDateBreadcrumb';

export const ByDateHeader = () => {
  return (
    <PageHeader>
      <PageHeader.Start>
        <ByDateBreadcrumb />
      </PageHeader.Start>
    </PageHeader>
  );
};
