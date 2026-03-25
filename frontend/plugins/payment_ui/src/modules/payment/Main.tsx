import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const IndexPage = lazy(() =>
  import('~/pages/payment/InvoicesPage').then((module) => ({
    default: module.InvoicesPage,
  })),
);


const PaymentMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        {/* Admin page */}
        <Route path="/" element={<IndexPage />} />
      </Routes>
    </Suspense>
  );
};

export default PaymentMain;
