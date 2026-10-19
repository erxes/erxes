import {
  AppLayout,
  Breadcrumb,
  Button,
  PageContainer,
  Spinner,
} from 'erxes-ui';
import { IconFileInvoice } from '@tabler/icons-react';
import { Navigate, Route, Routes } from 'react-router';
import { Suspense, lazy } from 'react';
import {
  PaymentSettingsLayout,
  PaymentSidebar,
  PaymentSidebarFooter,
} from '~/Sidebar';
import { PageHeader, PluginSettingsRoutes } from 'ui-modules';
import { useTranslation } from 'react-i18next';

const InvoicesPage = lazy(() =>
  import('~/pages/payment/InvoicesPage').then((module) => ({
    default: module.InvoicesPage,
  })),
);

const PaymentSettingsRoutes = lazy(() => import('./Settings'));

const InvoicesIndexPage = () => {
  const { t } = useTranslation('payment');

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost">
                  <IconFileInvoice />
                  {t('invoices')}
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
      </PageHeader>
      <InvoicesPage />
    </PageContainer>
  );
};

const PaymentAppRoutes = () => (
  <AppLayout
    id="payment"
    title="Payment"
    sidebar={<PaymentSidebar />}
    footer={<PaymentSidebarFooter />}
  >
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route index element={<Navigate to="invoices" replace />} />
        <Route path="invoices" element={<InvoicesIndexPage />} />
      </Routes>
    </Suspense>
  </AppLayout>
);

/** The payment app: invoices, plus its settings at `/payment/settings/*`. */
const PaymentEntry = () => (
  <Routes>
    <Route
      path="settings/*"
      element={
        <PaymentSettingsLayout>
          <Suspense fallback={<Spinner />}>
            <PluginSettingsRoutes
              pluginName="payment"
              basePath="/payment/settings"
            >
              <PaymentSettingsRoutes />
            </PluginSettingsRoutes>
          </Suspense>
        </PaymentSettingsLayout>
      }
    />
    <Route path="*" element={<PaymentAppRoutes />} />
  </Routes>
);

export default PaymentEntry;
