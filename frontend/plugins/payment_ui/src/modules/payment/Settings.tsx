import { Route, Routes } from 'react-router-dom';
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

export const CorporateGatewayPage = lazy(() =>
  import('~/pages/payment/CorporateGatewayPage').then((module) => ({
    default: module.default,
  })),
);

const PaymentSettings = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<PaymentSettingsPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="corporate-gateway" element={<CorporateGatewayPage />} />
      </Routes>
    </Suspense>
  );
};

export default PaymentSettings;
