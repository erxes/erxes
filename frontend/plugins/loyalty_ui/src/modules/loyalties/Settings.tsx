import { Routes, Route, Navigate } from 'react-router';
import { lazy, Suspense } from 'react';
import { Spinner } from 'erxes-ui';
import { LoyaltyMainLayout } from './components/LoyaltyMainLayout';

const VoucherPage = lazy(() =>
  import('~/pages/loyalties/VoucherPage').then((module) => ({
    default: module.VoucherPage,
  })),
);

const LotteryPage = lazy(() =>
  import('~/pages/loyalties/LotteryPage').then((module) => ({
    default: module.LotteryPage,
  })),
);

const SpinPage = lazy(() =>
  import('~/pages/loyalties/SpinPage').then((module) => ({
    default: module.SpinPage,
  })),
);

const DonatePage = lazy(() =>
  import('~/pages/loyalties/DonatePage').then((module) => ({
    default: module.DonatePage,
  })),
);

const ScorePage = lazy(() =>
  import('~/pages/loyalties/ScorePage').then((module) => ({
    default: module.ScorePage,
  })),
);

const AssignmentPage = lazy(() =>
  import('~/pages/loyalties/AssignmentPage').then((module) => ({
    default: module.AssignmentPage,
  })),
);

const AgentPage = lazy(() =>
  import('~/pages/loyalties/AgentPage').then((module) => ({
    default: module.AgentPage,
  })),
);

const CouponPage = lazy(() =>
  import('~/pages/loyalties/CouponPage').then((module) => ({
    default: module.CouponPage,
  })),
);

const LoyaltySettingsRoutes = () => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-full w-full">
          <Spinner />
        </div>
      }
    >
      <LoyaltyMainLayout>
        <Routes>
          <Route index element={<Navigate to="vouchers" replace />} />
          <Route path="vouchers" element={<VoucherPage />} />
          <Route path="lotteries" element={<LotteryPage />} />
          <Route path="spins" element={<SpinPage />} />
          <Route path="donates" element={<DonatePage />} />
          <Route path="score" element={<ScorePage />} />
          <Route path="assignments" element={<AssignmentPage />} />
          <Route path="agents" element={<AgentPage />} />
          <Route path="coupons" element={<CouponPage />} />
          <Route path="/*" element={<Navigate to="vouchers" replace />} />
        </Routes>
      </LoyaltyMainLayout>
    </Suspense>
  );
};

export default LoyaltySettingsRoutes;
