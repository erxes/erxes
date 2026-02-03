import { Route, Routes } from 'react-router-dom';
import { lazy } from 'react';

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

const paymentSettings = () => {
  return (
    <Routes>
    <Route path="/" element={<PaymentSettingsPage />} />
    <Route path="invoices" element={<InvoicesPage />} />
    </Routes>
  );
};

export default paymentSettings;
