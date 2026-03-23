import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const IndexPage = lazy(() =>
  import('~/pages/payment/InvoicesPage').then((module) => ({
    default: module.InvoicesPage,
  })),
);

const PaymentWidget = lazy(() =>
  import('../../widgets/Widgets').then((module) => ({
    default: module.default,
  })),
);

const PaymentMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        {/* Admin page */}
        <Route path="/" element={<IndexPage />} />

        {/* PUBLIC WIDGET ROUTE */}
        <Route
          path="/pl:payment/widget/invoice/:id"
          element={<PaymentWidget />}
        />
      </Routes>
    </Suspense>
  );
};

export default PaymentMain;
