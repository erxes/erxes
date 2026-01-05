import { Filter, Spinner } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { SettingsHeader } from 'ui-modules';
import { LoyaltyBreadcrumb } from './LoyaltyBreadcrumb';
import { LoyaltySidebar } from './LoyaltySidebar';
export const LoyaltyGeneralConfigPage = lazy(() =>
  import('~/pages/loyalties-config/LoyaltyGeneralConfigPage').then(
    (module) => ({
      default: module.LoyaltyGeneralConfig,
    }),
  ),
);

const LoyaltyScorePage = lazy(() =>
  import('~/pages/loyalties-config/LoyaltyScorePage').then((module) => ({
    default: module.LoyaltyScorePage,
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
    <Filter id="loyalty-settings">
      <div className="flex flex-col flex-auto overflow-hidden">
        <SettingsHeader breadcrumbs={<LoyaltyBreadcrumb />} />
        <div className="flex flex-auto overflow-hidden">
          <LoyaltySidebar />
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-full w-full">
                <Spinner />
              </div>
            }
          >
            <Routes>
              <Route index element={<LoyaltyGeneralConfigPage />} />
              <Route path="score" element={<LoyaltyScorePage />} />
              <Route path="voucher" element={<LoyaltyVoucherPage />} />
              <Route path="lottery" element={<LoyaltyLotteryPage />} />
              <Route path="spin" element={<LoyaltySpinPage />} />
              <Route path="donate" element={<LoyaltyDonatePage />} />
              <Route path="assignment" element={<LoyaltyAssignmentPage />} />
              <Route path="coupon" element={<LoyaltyCouponPage />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </Filter>
  );
};
export default LoyaltySettings;
