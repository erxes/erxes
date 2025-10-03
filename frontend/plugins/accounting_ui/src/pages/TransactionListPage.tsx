import { TransactionTable } from '@/transactions/components/TransactionTable';
import { AddTransaction } from '@/transactions/components/AddTransaction';
import { AccountingHeader } from '@/layout/components/Header';
import { AccountingLayout } from '@/layout/components/Layout';
import { Button, Kbd } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { TransactionsFilterBar } from '@/transactions/components/TrListFilterBar';

export const TransactionListPage = () => {
  return (
    <AccountingLayout>
      <AccountingHeader>
        <AddTransaction>
          <Button>
            <IconPlus />
            Add Transaction
            <Kbd>C</Kbd>
          </Button>
        </AddTransaction>
      </AccountingHeader>
      <TransactionsFilterBar />
      <TransactionTable />
    </AccountingLayout>
  );
};
