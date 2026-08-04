import { useLocation } from 'react-router';
import { LoyaltyScoreAddHeader } from '../score/components/LoyaltyScoreAddHeader';
import { LoyaltyVoucherAddHeader } from '../voucher/components/VouchersHeader';
import { LoyaltyCouponAddHeader } from '../coupon/components/CouponHeader';
import { LoyaltyAssignmentAddHeader } from '../assignment/components/AssignmentHeader';
import { LoyaltyDonateHeader } from '../donate/components/DonateHeader';
import { LoyaltySpinHeader } from '../spin/components/SpinHeader';
import { LotteryHeader } from '../lottery/components/LotteryHeader';

export const LoyaltyTopBar = () => {
  const { pathname } = useLocation();

  if (pathname === '/settings/loyalty/config/score') {
    return (
      <div className="flex items-center gap-3">
        <LoyaltyScoreAddHeader />
      </div>
    );
  }
  if (pathname === '/settings/loyalty/config/voucher') {
    return (
      <div className="flex items-center gap-3">
        <LoyaltyVoucherAddHeader />
      </div>
    );
  }
  if (pathname === '/settings/loyalty/config/coupon') {
    return (
      <div className="flex items-center gap-3">
        <LoyaltyCouponAddHeader />
      </div>
    );
  }
  if (pathname === '/settings/loyalty/config/assignment') {
    return (
      <div className="flex items-center gap-3">
        <LoyaltyAssignmentAddHeader />
      </div>
    );
  }
  if (pathname === '/settings/loyalty/config/donate') {
    return (
      <div className="flex items-center gap-3">
        <LoyaltyDonateHeader />
      </div>
    );
  }
  if (pathname === '/settings/loyalty/config/spin') {
    return (
      <div className="flex items-center gap-3">
        <LoyaltySpinHeader />
      </div>
    );
  }
  if (pathname === '/settings/loyalty/config/lottery') {
    return (
      <div className="flex items-center gap-3">
        <LotteryHeader />
      </div>
    );
  }
  return null;
};
