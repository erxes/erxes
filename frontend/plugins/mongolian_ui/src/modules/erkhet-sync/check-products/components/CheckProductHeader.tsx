import { PageHeader } from 'ui-modules';
import { CheckProductBreadcrumb } from './CheckProductBreadcrumb';

export const CheckProductHeader = () => {
  return (
    <PageHeader>
      <PageHeader.Start>
        <CheckProductBreadcrumb />
      </PageHeader.Start>
    </PageHeader>
  );
};
