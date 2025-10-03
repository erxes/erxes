import { TrRecordTable } from '@/transactions/components/TrRecordTable';
import { AddTransaction } from '@/transactions/components/AddTransaction';
import { AccountingHeader } from '@/layout/components/Header';
import { AccountingLayout } from '@/layout/components/Layout';
import { Button } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { TransactionsFilterBar } from '@/transactions/components/TrListFilterBar';
import { TransactionsFilter } from '@/transactions/components/TrFilters';

export const TrRecordListPage = () => {
  return (
    <AccountingLayout>
      <AccountingHeader>
        <div className="px-3">
          <TransactionsFilter />
          <AddTransaction>
            <Button>
              <IconPlus />
              Add Transaction
            </Button>
          </AddTransaction>
        </div>
      </AccountingHeader>
      <TransactionsFilterBar />
      <TrRecordTable />
    </AccountingLayout>
  );
};
