import { AccountingHeader } from '@/layout/components/Header';
import { AccountingLayout } from '@/layout/components/Layout';
import { AddTransaction } from '@/transactions/components/AddTransaction';
import { TransactionsFilter } from '@/transactions/components/TrFilters';
import { TrRecordTable } from '@/transactions/components/TrRecordTable';
import { IconPlus } from '@tabler/icons-react';
import { Button, Kbd, PageSubHeader } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TrRecsTotalCount } from '~/modules/transactions/components/TrRecsTotalCount';

export const TrRecordListPage = () => {
  const { t } = useTranslation('accounting');
  return (
    <AccountingLayout>
      <AccountingHeader>
        <div className="px-3">
          <AddTransaction>
            <Button>
              <IconPlus />
              {t('add-transaction')}
              <Kbd>C</Kbd>
            </Button>
          </AddTransaction>
        </div>
      </AccountingHeader>
      <PageSubHeader>
        <TransactionsFilter afterBar={<TrRecsTotalCount />} />
      </PageSubHeader>
      <TrRecordTable />
    </AccountingLayout>
  );
};
