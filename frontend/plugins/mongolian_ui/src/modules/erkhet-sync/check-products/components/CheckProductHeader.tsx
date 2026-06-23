import { PageHeader } from 'ui-modules';
import { CheckProductBreadcrumb } from './CheckProductBreadcrumb';
import { CheckProductFilter } from './CheckProductFilter';
import CheckProductActions from './useCheckButton';

export const CheckProductHeader = () => {
  return (
    <PageHeader>
      <PageHeader.Start>
        <CheckProductBreadcrumb />
      </PageHeader.Start>
      <PageHeader.End>
        <CheckProductFilter />
        <CheckProductActions />
      </PageHeader.End>
    </PageHeader>
  );
};
