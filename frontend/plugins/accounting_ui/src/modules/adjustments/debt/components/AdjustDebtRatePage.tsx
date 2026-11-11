import { AddAdjustDebtRate } from './AdjustDebtRateForm';
import { AdjustDebtRateTable } from './AdjustDebtRateTable';
import { AccountingLayout } from '@/layout/components/Layout';
import { AdjustmentHeader } from '../../components/Header';
import { TransactionsFilter } from '@/transactions/components/TrFilters';
import { PageSubHeader } from 'erxes-ui';

export const AdjustDebtRatePage = () => {
  return (
    <AccountingLayout>
      <AdjustmentHeader defaultKind="debRate">
        <AddAdjustDebtRate />
      </AdjustmentHeader>
      <PageSubHeader>
        <TransactionsFilter />
      </PageSubHeader>
      <AdjustDebtRateTable />
    </AccountingLayout>
  );
};
