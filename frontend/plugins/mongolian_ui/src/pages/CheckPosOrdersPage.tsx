import { PageSubHeader } from 'erxes-ui';
import { CheckPosOrdersFilter } from '@/erkhet-sync/check-pos-orders/components/CheckPosOrdersFilter';
import { CheckPosOrdersRecordTable } from '@/erkhet-sync/check-pos-orders/components/CheckPosOrdersRecordTable';

export const CheckPosOrdersPage = () => {
  return (
    <>
      <PageSubHeader>
        <CheckPosOrdersFilter />
      </PageSubHeader>
      <CheckPosOrdersRecordTable />
    </>
  );
};
