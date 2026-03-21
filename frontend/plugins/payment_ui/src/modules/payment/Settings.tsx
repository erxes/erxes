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
export const PaymentWidget = lazy(() =>
  import('../../widgets/Widgets').then((module) => ({
    default: module.default,
  })),
);

const PaymentSettings = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route index element={<Navigate to="methods" replace />} />
        <Route path="methods" element={<PaymentSettingsPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
       <Route path="widget/invoice/:id" element={<PaymentWidget />} />
      </Routes>
    </Suspense>
  );
};

export default PaymentSettings;
