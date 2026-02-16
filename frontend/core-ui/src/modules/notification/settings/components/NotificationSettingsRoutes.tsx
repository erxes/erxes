import { PageContainer } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { Outlet, Route, Routes } from 'react-router';
import { SettingsHeader } from 'ui-modules';
import NotificationBreadcrumb from './NotificationSettingsBreadcrumb';

const NotificationIndexPage = lazy(() =>
  import('~/pages/settings/account/notification/NotificationIndexPage').then(
    (module) => ({
      default: module.NotificationIndexPage,
    }),
  ),
);

const NotificationEmailIndexPage = lazy(() =>
  import(
    '~/pages/settings/account/notification/NotificationEmailIndexPage'
  ).then((module) => ({
    default: module.NotificationEmailIndexPage,
  })),
);

const NotificationMobileIndexPage = lazy(() =>
  import(
    '~/pages/settings/account/notification/NotificationMobileIndexPage'
  ).then((module) => ({
    default: module.NotificationMobileIndexPage,
  })),
);

const NotificationOtherPage = lazy(() =>
  import('~/pages/settings/account/notification/NotificationOtherPage').then(
    (module) => ({ default: module.NotificationOtherPage }),
  ),
);

export const NotificationSettingsRoutes = () => {
  return (
    <Suspense fallback={<></>}>
      <Routes>
        <Route
          element={
            <PageContainer>
              <SettingsHeader breadcrumbs={<NotificationBreadcrumb />} />
              <Outlet />
            </PageContainer>
          }
        >
          <Route index element={<NotificationIndexPage />} />
          <Route path="email" element={<NotificationEmailIndexPage />} />
          <Route path="mobile" element={<NotificationMobileIndexPage />} />
          <Route path="other" element={<NotificationOtherPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};
