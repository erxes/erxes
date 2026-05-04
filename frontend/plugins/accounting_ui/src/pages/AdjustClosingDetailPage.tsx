import { useParams } from 'react-router-dom';
import { AdjustClosingDetail } from '~/modules/adjustments/closing/components/AdjustClosingDetail';
import { AccountingHeader } from '~/modules/layout/components/Header';
import { AccountingLayout } from '~/modules/layout/components/Layout';

export const AdjustClosingDetailPage = () => {
  const { id } = useParams();
  console.log('closing id:', id);
  return (
    <AccountingLayout>
      <AccountingHeader
        returnLink="/accounting/adjustment/closing"
        returnText="Closing"
      />
      <AdjustClosingDetail id={id} />
    </AccountingLayout>
  );
};
