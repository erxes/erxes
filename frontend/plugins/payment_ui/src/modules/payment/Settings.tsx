import { Navigate, Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';

export const PaymentSettingsPage = lazy(() =>
  import('~/pages/payment/PaymentSettingsPage').then((module) => ({
    default: module.default,
  })),
);

export const InvoicesPage = lazy(() =>
  import('~/pages/payment/InvoicesPage').then((module) => ({
    default: module.InvoicesPage,
  })),
);

const PaymentSettings = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route index element={<Navigate to="methods" replace />} />
        <Route path="methods" element={<PaymentSettingsPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
      </Routes>
    </Suspense>
  );
};

export default PaymentSettings;
