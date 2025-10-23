import { Navigate, Route, Routes } from 'react-router';
import { Suspense, lazy } from 'react';
import { Spinner } from 'erxes-ui/components';

const DealsMain = lazy(() =>
  import('~/pages/SalesIndexPage').then((module) => ({
    default: module.SalesIndexPage,
  })),
);

const OrdersMain = lazy(() =>
  import('~/pages/OrdersPage').then((module) => ({
    default: module.OrdersPage,
  })),
);

const CoversMain = lazy(() =>
  import('~/pages/CoversPage').then((module) => ({
    default: module.CoversPage,
  })),
);

const PosMain = lazy(() =>
  import('~/pages/PosIndexPage').then((module) => ({
    default: module.PosIndexPage,
  })),
);

const PosItemsMain = lazy(() =>
  import('~/pages/PosItemsPage').then((module) => ({
    default: module.PosItemsPage,
  })),
);

const PosSummaryMain = lazy(() =>
  import('~/pages/PosSummaryPage').then((module) => ({
    default: module.PosSummaryPage,
  })),
);

const PosOrdersByCustomerMain = lazy(() =>
  import('~/pages/PosOrdersByCustomerPage').then((module) => ({
    default: module.PosOrdersByCustomerPage,
  })),
);

const PosOrdersBySubsMain = lazy(() =>
  import('~/pages/PosOrderBySubsPage').then((module) => ({
    default: module.PosOrderBySubsPage,
  })),
);

const PosByItemsMain = lazy(() =>
  import('~/pages/PosByitemsPage').then((module) => ({
    default: module.PosByItemsPage,
  })),
);

const App = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/" element={<Navigate to="deals" replace />} />
        <Route path="/deals" element={<DealsMain />} />
        <Route path="/pos" element={<PosMain />} />
        <Route path="/pos/:posId/orders" element={<OrdersMain />} />
        <Route path="/pos/:posId/covers" element={<CoversMain />} />
        <Route path="/pos/:posId/by-items" element={<PosByItemsMain />} />
        <Route path="/pos/:posId/items" element={<PosItemsMain />} />
        <Route path="/pos/:posId/summary" element={<PosSummaryMain />} />
        <Route
          path="/pos/:posId/orders-by-customer"
          element={<PosOrdersByCustomerMain />}
        />
        <Route
          path="/pos/:posId/orders-by-subscription"
          element={<PosOrdersBySubsMain />}
        />
      </Routes>
    </Suspense>
  );
};

export default App;
