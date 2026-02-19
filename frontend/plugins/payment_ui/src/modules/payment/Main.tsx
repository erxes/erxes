import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const InvoicesPage = lazy(() =>
  import('~/pages/payment/InvoicesPage').then((module) => ({
    default: module.InvoicesPage,
  })),
);

const PaymentMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="invoices" element={<InvoicesPage />} />
      </Routes>
    </Suspense>
  );
};

export default PaymentMain;
