import { useLocation } from 'react-router';
import { LoyaltyScoreAddHeader } from '../score/components/LoyaltyScoreAddHeader';
import { LoyaltyVoucherAddHeader } from '../voucher/components/VouchersHeader';
import { LoyaltyCouponAddHeader } from '../coupon/components/CouponHeader';
import { LoyaltyAssignmentAddHeader } from '../assignment/components/AssignmentHeader';
import { LoyaltyDonateHeader } from '../donate/components/DonateHeader';

export const LoyaltyTopBar = () => {
  const { pathname } = useLocation();

  if (pathname === '/settings/loyalty/score') {
    return (
      <div className="flex items-center gap-3">
        <LoyaltyScoreAddHeader />
      </div>
    );
  }
  if (pathname === '/settings/loyalty/voucher') {
    return (
      <div className="flex items-center gap-3">
        <LoyaltyVoucherAddHeader />
      </div>
    );
  }
  if (pathname === '/settings/loyalty/coupon') {
    return (
      <div className="flex items-center gap-3">
        <LoyaltyCouponAddHeader />
      </div>
    );
  }
  if (pathname === '/settings/loyalty/assignment') {
    return (
      <div className="flex items-center gap-3">
        <LoyaltyAssignmentAddHeader />
      </div>
    );
  }
  if (pathname === '/settings/loyalty/donate') {
    return (
      <div className="flex items-center gap-3">
        <LoyaltyDonateHeader />
      </div>
    );
  }
  return null;
};
