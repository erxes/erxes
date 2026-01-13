import { useLocation } from 'react-router';
import { LoyaltyScoreAddHeader } from '../score/components/LoyaltyScoreAddHeader';
import { LoyaltyVoucherAddHeader } from '../voucher/components/VouchersHeader';

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
  return null;
};
