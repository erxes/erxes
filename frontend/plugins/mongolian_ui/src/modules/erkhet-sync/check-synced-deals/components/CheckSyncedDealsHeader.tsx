import { PageHeader } from 'ui-modules';
import { CheckSyncedDealsBreadcrumb } from './CheckSyncedDealsBreadcrumb';

export const CheckSyncedDealsHeader = () => {
  return (
    <PageHeader>
      <PageHeader.Start>
        <CheckSyncedDealsBreadcrumb />
      </PageHeader.Start>
    </PageHeader>
  );
};
