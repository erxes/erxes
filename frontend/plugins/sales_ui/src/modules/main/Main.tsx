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

const App = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/" element={<Navigate to="deals" replace />} />
        <Route path="/deals" element={<DealsMain />} />
        <Route path="/pos" element={<Navigate to="orders" replace />} />
        <Route path="/pos/:posId/orders" element={<OrdersMain />} />
        <Route path="/pos" element={<Navigate to="covers" replace />} />
        <Route path="/pos/:posId/covers" element={<CoversMain />} />
        <Route path="/pos/:posId" element={<PosMain />} />
        <Route path="/pos/:posId/items" element={<PosItemsMain />} />
      </Routes>
    </Suspense>
  );
};

export default App;
