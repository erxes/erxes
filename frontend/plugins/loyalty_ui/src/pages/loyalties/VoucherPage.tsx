import { useEffect } from 'react';
import { VoucherRecordTable } from '~/modules/loyalties/vouchers/components/VoucherRecordTable';
import { VoucherAddSheet } from '~/modules/loyalties/vouchers/components/VoucherAddSheet';
import { useLoyaltyHeaderAction } from '~/modules/loyalties/components/LoyaltyHeaderActionContext';
import { VoucherFilter } from '~/modules/loyalties/vouchers/components/VoucherFilter';
import { PageSubHeader } from 'erxes-ui';

export const VoucherPage = () => {
  const { setAction } = useLoyaltyHeaderAction();

  useEffect(() => {
    setAction(<VoucherAddSheet />);
    return () => setAction(null);
  }, [setAction]);

  return (
    <div className="flex flex-col flex-auto overflow-hidden">
      <PageSubHeader>
        <VoucherFilter />
      </PageSubHeader>
      <VoucherRecordTable />
    </div>
  );
};
