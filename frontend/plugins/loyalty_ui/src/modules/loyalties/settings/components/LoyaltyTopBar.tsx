import { useLocation } from 'react-router';
import { LoyaltyAccountTypeAddHeader } from '../account-type/components/LoyaltyAccountTypeAddHeader';
import { LoyaltyScoreAddHeader } from '../score/components/LoyaltyScoreAddHeader';
import { LoyaltyVoucherAddHeader } from '../voucher/components/VouchersHeader';
import { LoyaltyCouponAddHeader } from '../coupon/components/CouponHeader';
import { LoyaltyAssignmentAddHeader } from '../assignment/components/AssignmentHeader';
import { LoyaltyDonateHeader } from '../donate/components/DonateHeader';
import { LoyaltySpinHeader } from '../spin/components/SpinHeader';
import { LotteryHeader } from '../lottery/components/LotteryHeader';

export const LoyaltyTopBar = () => {
  const { pathname } = useLocation();

  if (pathname === '/loyalty/settings/config/account-type') {
    return (
      <div className="flex items-center gap-3">
        <LoyaltyAccountTypeAddHeader />
      </div>
    );
  }
  if (pathname === '/loyalty/settings/config/score') {
    return (
      <div className="flex items-center gap-3">
        <LoyaltyScoreAddHeader />
      </div>
    );
  }
  if (pathname === '/loyalty/settings/config/voucher') {
    return (
      <div className="flex items-center gap-3">
        <LoyaltyVoucherAddHeader />
      </div>
    );
  }
  if (pathname === '/loyalty/settings/config/coupon') {
    return (
      <div className="flex items-center gap-3">
        <LoyaltyCouponAddHeader />
      </div>
    );
  }
  if (pathname === '/loyalty/settings/config/assignment') {
    return (
      <div className="flex items-center gap-3">
        <LoyaltyAssignmentAddHeader />
      </div>
    );
  }
  if (pathname === '/loyalty/settings/config/donate') {
    return (
      <div className="flex items-center gap-3">
        <LoyaltyDonateHeader />
      </div>
    );
  }
  if (pathname === '/loyalty/settings/config/spin') {
    return (
      <div className="flex items-center gap-3">
        <LoyaltySpinHeader />
      </div>
    );
  }
  if (pathname === '/loyalty/settings/config/lottery') {
    return (
      <div className="flex items-center gap-3">
        <LotteryHeader />
      </div>
    );
  }
  return null;
};
