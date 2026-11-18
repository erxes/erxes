import { AddAdjustFundRate } from './AdjustFundRateForm';
import { AdjustFundRateTable } from './AdjustFundRateTable';
import { AccountingLayout } from '@/layout/components/Layout';
import { AdjustmentHeader } from '../../components/Header';
import { AdjustFundRateFilter } from '@/adjustments/rate/components/AdjustFundRateFilter';
import { PageSubHeader } from 'erxes-ui';

export const AdjustFundRatePage = () => {
  return (
    <AccountingLayout>
      <AdjustmentHeader defaultKind="fundRate">
        <AddAdjustFundRate />
      </AdjustmentHeader>
      <PageSubHeader>
        <AdjustFundRateFilter />
      </PageSubHeader>
      <AdjustFundRateTable />
    </AccountingLayout>
  );
};
