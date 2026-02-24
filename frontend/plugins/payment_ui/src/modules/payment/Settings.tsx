import { Route, Routes } from 'react-router-dom';
import { lazy } from 'react';

export const PaymentSettingsPage = lazy(() =>
  import('~/pages/payment/PaymentSettingsPage').then((module) => ({
    default: module.default,
  })),
);

const paymentSettings = () => {
  return (
    <Routes>
      <Route path="/" element={<PaymentSettingsPage />} />
    </Routes>
  );
};

export default paymentSettings;
