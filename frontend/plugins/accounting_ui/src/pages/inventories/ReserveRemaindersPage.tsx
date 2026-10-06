import { useTranslation } from 'react-i18next';
import { PageSubHeader } from 'erxes-ui';
import { ReserveRemFilter } from '~/modules/inventories/reserveRemainders/components/ReserveRemFilters';
import { AddReserveRem } from '~/modules/inventories/reserveRemainders/components/ReserveRemForm';
import { ReserveRemTable } from '~/modules/inventories/reserveRemainders/components/ReserveRemTable';
import { ReserveRemsTotalCount } from '~/modules/inventories/reserveRemainders/components/ReserveRemsTotalCount';
import { AccountingHeader } from '~/modules/layout/components/Header';
import { AccountingLayout } from '~/modules/layout/components/Layout';

export const ReserveRemaindersPage = () => {
  const { t } = useTranslation('accounting');
  return (
    <AccountingLayout>
      <AccountingHeader
        returnLink="/accounting/inventories/reserve-remainders"
        returnText={t('Reserve Remainders')}
        skipSettings={true}
      >
        <AddReserveRem />
      </AccountingHeader>
      <PageSubHeader>
        <ReserveRemFilter afterBar={<ReserveRemsTotalCount />} />
      </PageSubHeader>
      <ReserveRemTable />
    </AccountingLayout>
  );
};
