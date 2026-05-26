import { PageHeader } from 'ui-modules';
import { CheckCategoryBreadcrumb } from './CheckCategoryBreadcrumb';
import { CheckCategoryFilter } from './CheckCategoryFilter';
import CheckCategoryActions from './useCheckButton';

export const CheckCategoryHeader = () => {
  return (
    <PageHeader>
      <PageHeader.Start>
        <CheckCategoryBreadcrumb />
      </PageHeader.Start>
      <PageHeader.End>
        <CheckCategoryFilter />
        <CheckCategoryActions />
      </PageHeader.End>
    </PageHeader>
  );
};
