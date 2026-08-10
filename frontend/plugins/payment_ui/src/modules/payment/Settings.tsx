import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { PageContainer } from 'erxes-ui';
import { SettingsHeader } from 'ui-modules';
import { PaymentSettingsBreadcrumb } from '@/settings/payment/components/PaymentSettingsBreadcrumb';

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
        <Route
          element={
            <PageContainer>
              <SettingsHeader breadcrumbs={<PaymentSettingsBreadcrumb />} />
              <Outlet />
            </PageContainer>
          }
        >
          <Route index element={<Navigate to="methods" replace />} />
          <Route path="methods" element={<PaymentSettingsPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="corporate-gateway" element={<CorporateGatewayPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default PaymentSettings;
