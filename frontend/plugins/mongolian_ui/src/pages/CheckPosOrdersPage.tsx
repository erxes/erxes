import { PageContainer, PageSubHeader } from 'erxes-ui';
import { CheckPosOrdersHeader } from '@/erkhet-sync/check-pos-orders/components/CheckPosOrdersHeader';
import { CheckPosOrdersFilter } from '@/erkhet-sync/check-pos-orders/components/CheckPosOrdersFilter';
import { CheckPosOrdersRecordTable } from '@/erkhet-sync/check-pos-orders/components/CheckPosOrdersRecordTable';

export const CheckPosOrdersPage = () => {
  return (
    <PageContainer>
      <CheckPosOrdersHeader />
      <PageSubHeader>
        <CheckPosOrdersFilter />
      </PageSubHeader>
      <CheckPosOrdersRecordTable />
    </PageContainer>
  );
};
