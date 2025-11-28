import { AccountingHeader } from '@/layout/components/Header';
import { AccountingLayout } from '@/layout/components/Layout';
import { AddTransaction } from '@/transactions/components/AddTransaction';
import { TransactionTable } from '@/transactions/components/TransactionTable';
import { TransactionsFilter } from '@/transactions/components/TrFilters';
import { IconPlus } from '@tabler/icons-react';
import { Button, Kbd, PageSubHeader } from 'erxes-ui';
import { TrsTotalCount } from '~/modules/transactions/components/TrsTotalCount';

export const TransactionListPage = () => {
  return (
    <AccountingLayout>
      <AccountingHeader>
        <div className="px-3">
          <AddTransaction>
            <Button>
              <IconPlus />
              Add Transaction
              <Kbd>C</Kbd>
            </Button>
          </AddTransaction>
        </div>
      </AccountingHeader>
      <PageSubHeader>
        <TransactionsFilter afterBar={<TrsTotalCount />} />
      </PageSubHeader>
      <TransactionTable />
    </AccountingLayout>
  );
};
