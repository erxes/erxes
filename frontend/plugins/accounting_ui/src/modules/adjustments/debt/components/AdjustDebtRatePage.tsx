import { AddAdjustDebtRate } from './AdjustDebtRateForm';
import { AdjustDebtRateTable } from './AdjustDebtRateTable';
import { AccountingLayout } from '@/layout/components/Layout';
import { AdjustmentHeader } from '../../components/Header';
import { AdjustDebtRateFilter } from '@/adjustments/debt/components/AdjustDebtRateFilter';
import { PageSubHeader } from 'erxes-ui';

export const AdjustDebtRatePage = () => {
  return (
    <AccountingLayout>
      <AdjustmentHeader defaultKind="debRate">
        <AddAdjustDebtRate />
      </AdjustmentHeader>
      <PageSubHeader>
        <AdjustDebtRateFilter />
      </PageSubHeader>
      <AdjustDebtRateTable />
    </AccountingLayout>
  );
};
