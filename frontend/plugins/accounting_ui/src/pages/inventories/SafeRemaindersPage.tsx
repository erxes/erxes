import { PageSubHeader } from 'erxes-ui';
import { SafeRemainderFilter } from '~/modules/inventories/safeRemainders/components/SafeRemainderFilters';
import { AddSafeRemainder } from '~/modules/inventories/safeRemainders/components/SafeRemainderForm';
import { SafeRemainderTable } from '~/modules/inventories/safeRemainders/components/SafeRemainderTable';
import { AccountingHeader } from '~/modules/layout/components/Header';
import { AccountingLayout } from '~/modules/layout/components/Layout';

export const SafeRemaindersPage = () => {
  return (
    <AccountingLayout>
      <AccountingHeader
        returnLink="/accounting/inventories/safe-remainders"
        returnText="Safe Remainders"
        skipSettings={true}
      >
        <AddSafeRemainder />
      </AccountingHeader>
      <PageSubHeader>
        <SafeRemainderFilter />
      </PageSubHeader>
      <SafeRemainderTable />;
    </AccountingLayout>
  );
};
