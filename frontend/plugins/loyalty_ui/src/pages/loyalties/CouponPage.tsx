import { useEffect } from 'react';
import { Button, PageSubHeader } from 'erxes-ui';
import { Link } from 'react-router';
import { IconSettings } from '@tabler/icons-react';
import { Can, Export } from 'ui-modules';
import { useLoyaltyHeaderAction } from '~/modules/loyalties/components/LoyaltyHeaderActionContext';
import { CouponRecordTable } from '~/modules/loyalties/coupons/components/CouponRecordTable';
import { CouponAddModal } from '~/modules/loyalties/coupons/components/CouponAddModal';
import { CouponFilter } from '~/modules/loyalties/coupons/components/CouponFilter';

const CouponHeaderActions = () => (
  <div className="flex items-center gap-2">
    <Button variant="outline" size="sm" asChild>
      <Link to="/settings/loyalty/config/coupon">
        <IconSettings className="size-4" />
        Go to settings
      </Link>
    </Button>
    <Can action="couponExportManage">
      <Export
        pluginName="loyalty"
        moduleName="coupon"
        collectionName="coupon"
      />
    </Can>
    <CouponAddModal />
  </div>
);

export const CouponPage = () => {
  const { setAction } = useLoyaltyHeaderAction();

  useEffect(() => {
    setAction(<CouponHeaderActions />);
    return () => setAction(null);
  }, [setAction]);

  return (
    <div className="flex flex-col flex-auto overflow-hidden">
      <PageSubHeader>
        <CouponFilter />
      </PageSubHeader>
      <CouponRecordTable />
    </div>
  );
};
