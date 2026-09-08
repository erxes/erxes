import { PageSubHeader } from 'erxes-ui';
import { FxaRemainderFilters } from '~/modules/fixedAssets/remainders/components/FxaRemainderFilters';
import { FxaRemaindersTable } from '~/modules/fixedAssets/remainders/components/FxaRemaindersTable';
import { AccountingHeader } from '~/modules/layout/components/Header';
import { AccountingLayout } from '~/modules/layout/components/Layout';

export const FxaRemaindersPage = () => {
  return (
    <AccountingLayout>
      <AccountingHeader
        returnLink="/accounting/fixed-assets/remainders"
        returnText="Үлдэгдэл"
        skipSettings={true}
      />
      <PageSubHeader>
        <FxaRemainderFilters />
      </PageSubHeader>
      <FxaRemaindersTable />
    </AccountingLayout>
  );
};
