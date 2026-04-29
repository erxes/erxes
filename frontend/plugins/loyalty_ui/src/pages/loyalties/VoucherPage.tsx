import { useEffect } from 'react';
import { Button, PageSubHeader } from 'erxes-ui';
import { Link } from 'react-router';
import { IconSettings } from '@tabler/icons-react';
import { VoucherRecordTable } from '~/modules/loyalties/vouchers/components/VoucherRecordTable';
import { VoucherAddSheet } from '~/modules/loyalties/vouchers/components/VoucherAddSheet';
import { useLoyaltyHeaderAction } from '~/modules/loyalties/components/LoyaltyHeaderActionContext';
import { VoucherFilter } from '~/modules/loyalties/vouchers/components/VoucherFilter';

const VoucherHeaderActions = () => (
  <div className="flex items-center gap-2">
    <Button variant="outline" size="sm" asChild>
      <Link to="/settings/loyalty/config/voucher">
        <IconSettings className="size-4" />
        Go to settings
      </Link>
    </Button>
    <VoucherAddSheet />
  </div>
);

export const VoucherPage = () => {
  const { setAction } = useLoyaltyHeaderAction();

  useEffect(() => {
    setAction(<VoucherHeaderActions />);
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
