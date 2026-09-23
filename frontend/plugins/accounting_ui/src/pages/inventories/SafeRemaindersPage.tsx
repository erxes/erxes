import { PageSubHeader } from 'erxes-ui';
import { SafeRemainderFilter } from '~/modules/inventories/safeRemainders/components/SafeRemainderFilters';
import { AddSafeRemainder } from '~/modules/inventories/safeRemainders/components/SafeRemainderForm';
import { SafeRemainderTable } from '~/modules/inventories/safeRemainders/components/SafeRemainderTable';
import { SafeRemaindersTotalCount } from '~/modules/inventories/safeRemainders/components/SafeRemaindersTotalCount';
import { useSafeRemainders } from '~/modules/inventories/safeRemainders/hooks/useSafeRemainders';
import { AccountingHeader } from '~/modules/layout/components/Header';
import { AccountingLayout } from '~/modules/layout/components/Layout';

export const SafeRemaindersPage = () => {
  const { safeRemainders, loading, totalCount, handleFetchMore } =
    useSafeRemainders();

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
        <SafeRemainderFilter
          afterBar={
            <SafeRemaindersTotalCount loading={loading} totalCount={totalCount} />
          }
        />
      </PageSubHeader>
      <SafeRemainderTable
        handleFetchMore={handleFetchMore}
        loading={loading}
        safeRemainders={safeRemainders}
        totalCount={totalCount}
      />
    </AccountingLayout>
  );
};
