import { PageSubHeader } from 'erxes-ui';
import { LoyaltyAccountFilter } from '~/modules/loyalties/accounts/components/LoyaltyAccountFilter';
import { LoyaltyAccountRecordTable } from '~/modules/loyalties/accounts/components/LoyaltyAccountRecordTable';

export const AccountPage = () => (
  <div className="flex flex-auto flex-col overflow-hidden">
    <PageSubHeader>
      <LoyaltyAccountFilter />
    </PageSubHeader>
    <LoyaltyAccountRecordTable />
  </div>
);
