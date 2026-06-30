import { PageHeader } from 'ui-modules';
import { CheckPosOrdersBreadcrumb } from './CheckPosOrdersBreadcrumb';

export const CheckPosOrdersHeader = () => {
  return (
    <PageHeader>
      <PageHeader.Start>
        <CheckPosOrdersBreadcrumb />
        <PageHeader.FavoriteToggleButton />
      </PageHeader.Start>
    </PageHeader>
  );
};
