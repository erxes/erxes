import { PageHeader } from 'ui-modules';
import { DuplicatedBreadcrumb } from '@/put-responses-duplicated/components/DuplicatedBreadcrumb';

export const DuplicatedHeader = () => {
  return (
    <PageHeader>
      <PageHeader.Start>
        <DuplicatedBreadcrumb />
      </PageHeader.Start>
    </PageHeader>
  );
};
