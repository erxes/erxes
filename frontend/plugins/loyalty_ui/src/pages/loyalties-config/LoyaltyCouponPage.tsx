import { PageContainer } from 'erxes-ui';
import { CouponRecordTable } from '~/modules/loyalties/settings/coupon/components/CouponRecordTable';
import { LoyaltyCouponEditSheet } from '~/modules/loyalties/settings/coupon/coupon-detail/components/LoyaltyCouponEditSheet';

import { useQueryState } from 'erxes-ui';

export const LoyaltyCouponPage = () => {
  const [editCouponId] = useQueryState<string>('editCouponId');

  return (
    <PageContainer>
      <CouponRecordTable />
      {editCouponId && <LoyaltyCouponEditSheet couponId={editCouponId} />}
    </PageContainer>
  );
};
