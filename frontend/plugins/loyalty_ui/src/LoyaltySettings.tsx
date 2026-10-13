import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { LoyaltySettingsPaths } from './types/settingsPaths';
import PricingSettings from './pages/pricing/PricingSettingsPage';

const LoyaltyScorePage = lazy(() =>
  import('~/pages/loyalties-config/LoyaltyScorePage').then((module) => ({
    default: module.LoyaltyScorePage,
  })),
);

const LoyaltyAccountTypePage = lazy(() =>
  import('~/pages/loyalties-config/LoyaltyAccountTypePage').then((module) => ({
    default: module.LoyaltyAccountTypePage,
  })),
);

const LoyaltyVoucherPage = lazy(() =>
  import('~/pages/loyalties-config/LoyaltyVoucherPage').then((module) => ({
    default: module.LoyaltyVoucherPage,
  })),
);

const LoyaltyLotteryPage = lazy(() =>
  import('~/pages/loyalties-config/LoyaltyLotteryPage').then((module) => ({
    default: module.LoyaltyLotteryPage,
  })),
);

const LoyaltySpinPage = lazy(() =>
  import('~/pages/loyalties-config/LoyaltySpinPage').then((module) => ({
    default: module.LoyaltySpinPage,
  })),
);

const LoyaltyDonatePage = lazy(() =>
  import('~/pages/loyalties-config/LoyaltyDonatePage').then((module) => ({
    default: module.LoyaltyDonatePage,
  })),
);

const LoyaltyAssignmentPage = lazy(() =>
  import('~/pages/loyalties-config/LoyaltyAssignmentPage').then((module) => ({
    default: module.LoyaltyAssignmentPage,
  })),
);
const LoyaltyCouponPage = lazy(() =>
  import('~/pages/loyalties-config/LoyaltyCouponPage').then((module) => ({
    default: module.LoyaltyCouponPage,
  })),
);

const LoyaltySettings = () => {
  return (
    <Routes>
      <Route
        index
        element={<Navigate to={LoyaltySettingsPaths.Config} replace />}
      />
      <Route path={LoyaltySettingsPaths.Config}>
        {/* Wallets come first: every campaign writes to one */}
        <Route index element={<Navigate to="account-type" replace />} />
        <Route path="account-type" element={<LoyaltyAccountTypePage />} />
        <Route path="score" element={<LoyaltyScorePage />} />
        <Route path="voucher" element={<LoyaltyVoucherPage />} />
        <Route path="lottery" element={<LoyaltyLotteryPage />} />
        <Route path="spin" element={<LoyaltySpinPage />} />
        <Route path="donate" element={<LoyaltyDonatePage />} />
        <Route path="assignment" element={<LoyaltyAssignmentPage />} />
        <Route path="coupon" element={<LoyaltyCouponPage />} />
      </Route>
      <Route
        path={`${LoyaltySettingsPaths.Pricing}/*`}
        element={<PricingSettings />}
      />
    </Routes>
  );
};
export default LoyaltySettings;
