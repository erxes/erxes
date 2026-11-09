import { AccountingHeader } from '@/layout/components/Header';
import { AccountingLayout } from '@/layout/components/Layout';
import { AddTransaction } from '@/transactions/components/AddTransaction';
import { TransactionTable } from '@/transactions/components/TransactionTable';
import { TransactionsFilter } from '@/transactions/components/TrFilters';
import { useTransactionsFilterVariables } from '@/transactions/hooks/useTransactionVars';
import { IconPlus } from '@tabler/icons-react';
import { Button, Kbd, PageSubHeader } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Can, Export, Import } from 'ui-modules';
import { TrImportGuideDialog } from '@/transactions/components/TrImportGuide';
import { TrsTotalCount } from '@/transactions/components/TrsTotalCount';

const AddTransactionButton = () => {
  const { t } = useTranslation('accounting');

  return (
    <AddTransaction>
      <Button>
        <IconPlus />
        {t('add-transaction-label')}
        <Kbd>C</Kbd>
      </Button>
    </AddTransaction>
  );
};

export const TransactionListPage = () => {
  const { t } = useTranslation('accounting');
  const filterVariables = useTransactionsFilterVariables();

  return (
    <AccountingLayout>
      <AccountingHeader>
        <div className="px-3">
          <AddTransactionButton />
        </div>
      </AccountingHeader>
      <PageSubHeader>
        <TransactionsFilter afterBar={<TrsTotalCount />} />
        <Can action="transactionsExportManage">
          <Export
            pluginName="accounting"
            moduleName="account"
            collectionName="transactions"
            getFilters={() => filterVariables}
          />
        </Can>
        <Can action="transactionsImportManage">
          <Import
            pluginName="accounting"
            moduleName="account"
            collectionName="transactions"
            title={t('import-transactions')}
          >
            <TrImportGuideDialog />
          </Import>
        </Can>
      </PageSubHeader>
      <TransactionTable />
    </AccountingLayout>
  );
};
