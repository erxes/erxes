import { Route, Routes } from 'react-router';
import { Suspense, lazy } from 'react';

import { Spinner } from 'erxes-ui/components';

const OrdersMain = lazy(() => {
  console.log('Attempting to load OrdersPage...');
  return import('../../pages/OrdersPage')
    .then((module) => {
      console.log('OrdersPage loaded successfully:', module);
      return {
        default: module.OrdersPage,
      };
    })
    .catch((error) => {
      console.error('Failed to load OrdersPage:', error);
      throw error;
    });
});

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
  console.log('POS Main App component rendered');

  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/" element={<PosMain />} />
        <Route path=":posId/orders" element={<OrdersMain />} />
        <Route path=":posId/covers" element={<CoversMain />} />
        <Route path=":posId/by-items" element={<PosByItemsMain />} />
        <Route path=":posId/items" element={<PosItemsMain />} />
        <Route path=":posId/summary" element={<PosSummaryMain />} />
        <Route
          path=":posId/orders-by-customer"
          element={<PosOrdersByCustomerMain />}
        />
        <Route
          path=":posId/orders-by-subscription"
          element={<PosOrdersBySubsMain />}
        />
      </Routes>
    </Suspense>
  );
};

export default App;
