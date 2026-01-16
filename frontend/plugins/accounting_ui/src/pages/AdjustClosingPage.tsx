import { AccountingLayout } from '@/layout/components/Layout';
import { TransactionsFilter } from '@/transactions/components/TrFilters';
import { AdjustmentHeader } from '../modules/adjustments/components/Header';
import { PageSubHeader } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { AdjustClosingTable } from '~/modules/adjustments/closing/components/AdjustClosingTable';
import { AddAdjustClosing } from '~/modules/adjustments/closing/components/AddAdjustClosing';
import { AdjustClosingDetailSheet } from '~/modules/adjustments/closing/components/AdjustClosingDetailSheet';
import { AdjustClosingEntryDetail } from '~/modules/adjustments/closing/components/AdjustClosingDetail';

export const AdjustClosingListPage = () => {
  return (
    <AccountingLayout>
      <AdjustmentHeader>
        <div className="px-3">
          <AddAdjustClosing />
        </div>
      </AdjustmentHeader>
      <PageSubHeader>
        <TransactionsFilter />
      </PageSubHeader>
      <AdjustClosingTable />
    </AccountingLayout>
  );
};
