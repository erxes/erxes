import { AddAdjustFundRate } from './AdjustFundRateForm';
import { AdjustFundRateTable } from './AdjustFundRateTable';
import { AccountingLayout } from '@/layout/components/Layout';
import { AdjustmentHeader } from '../../components/Header';
import { TransactionsFilter } from '@/transactions/components/TrFilters';
import { PageSubHeader } from 'erxes-ui';

export const AdjustFundRatePage = () => {
  return (
    <AccountingLayout>
      <AdjustmentHeader defaultKind="fundRate">
        <div className="px-3">
          <AddAdjustFundRate />
        </div>
      </AdjustmentHeader>
      <PageSubHeader>
        <TransactionsFilter />
      </PageSubHeader>
      <AdjustFundRateTable />
    </AccountingLayout>
  );
};
