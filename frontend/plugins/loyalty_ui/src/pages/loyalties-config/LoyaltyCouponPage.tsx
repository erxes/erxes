import { PageContainer, useQueryState } from 'erxes-ui';
import { LoyaltyLayout } from '~/modules/loyalties/settings/components/LoyaltyLayout';
import { CouponRecordTable } from '~/modules/loyalties/settings/coupon/components/CouponRecordTable';
import { LoyaltyCouponEditSheet } from '~/modules/loyalties/settings/coupon/coupon-detail/components/LoyaltyCouponEditSheet';

export const LoyaltyCouponPage = () => {
  const [editCouponId] = useQueryState<string>('editCouponId');

  return (
    <LoyaltyLayout>
      <PageContainer>
        <CouponRecordTable />
        {editCouponId && <LoyaltyCouponEditSheet couponId={editCouponId} />}
      </PageContainer>
    </LoyaltyLayout>
  );
};
