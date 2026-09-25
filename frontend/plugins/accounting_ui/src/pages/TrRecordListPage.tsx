import { AccountingHeader } from '@/layout/components/Header';
import { AccountingLayout } from '@/layout/components/Layout';
import { AddTransaction } from '@/transactions/components/AddTransaction';
import { TransactionsFilter } from '@/transactions/components/TrFilters';
import { TrRecordTable } from '@/transactions/components/TrRecordTable';
import { useTransactionsFilterVariables } from '@/transactions/hooks/useTransactionVars';
import { IconPlus } from '@tabler/icons-react';
import { Button, Kbd, PageSubHeader } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Can, Export } from 'ui-modules';
import { TrRecsTotalCount } from '~/modules/transactions/components/TrRecsTotalCount';

export const TrRecordListPage = () => {
  const { t } = useTranslation('accounting');
  const filterVariables = useTransactionsFilterVariables();

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
        <Can action="transactionsExportManage">
          <Export
            pluginName="accounting"
            moduleName="account"
            collectionName="transactions"
            getFilters={() => filterVariables}
          />
        </Can>
      </PageSubHeader>
      <TrRecordTable />
    </AccountingLayout>
  );
};
