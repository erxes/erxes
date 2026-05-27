import { useEffect } from 'react';
import { PageSubHeader } from 'erxes-ui';
import { Export } from 'ui-modules';
import { useLoyaltyHeaderAction } from '~/modules/loyalties/components/LoyaltyHeaderActionContext';
import { CouponRecordTable } from '~/modules/loyalties/coupons/components/CouponRecordTable';
import { CouponAddModal } from '~/modules/loyalties/coupons/components/CouponAddModal';
import { CouponFilter } from '~/modules/loyalties/coupons/components/CouponFilter';

const CouponHeaderActions = () => (
  <div className="flex items-center gap-2">
    <Export pluginName="loyalty" moduleName="coupon" collectionName="coupon" />
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
