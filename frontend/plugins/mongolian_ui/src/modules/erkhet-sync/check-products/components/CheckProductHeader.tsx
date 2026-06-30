import { PageHeader } from 'ui-modules';
import { CheckProductBreadcrumb } from './CheckProductBreadcrumb';

export const CheckProductHeader = () => {
  return (
    <PageHeader>
      <PageHeader.Start>
        <CheckProductBreadcrumb />
        <PageHeader.FavoriteToggleButton />
      </PageHeader.Start>
    </PageHeader>
  );
};
