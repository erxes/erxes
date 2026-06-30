import { PageHeader } from 'ui-modules';
import { CheckCategoryBreadcrumb } from './CheckCategoryBreadcrumb';

export const CheckCategoryHeader = () => {
  return (
    <PageHeader>
      <PageHeader.Start>
        <CheckCategoryBreadcrumb />
        <PageHeader.FavoriteToggleButton />
      </PageHeader.Start>
    </PageHeader>
  );
};
