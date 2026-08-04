import { SettingsPath } from '@/types/paths/SettingsPath';
import { PageContainer } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { SettingsHeader } from 'ui-modules';
import NotificationBreadcrumb from './NotificationSettingsBreadcrumb';
import { NotificationSettingsLayout } from './NotificationSettingsLayout';

const NotificationIndexPage = lazy(() =>
  import('~/pages/settings/account/notification/NotificationIndexPage').then(
    (module) => ({
      default: module.NotificationIndexPage,
    }),
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
          <Route
            path="/"
            element={
              <Navigate
                to={`/${SettingsPath.Index}${SettingsPath.Notification}/core:structure`}
                replace
              />
            }
          />
          <Route
            path="/:event/*"
            element={
              <PageContainer>
                <NotificationSettingsLayout>
                  <Routes>
                    <Route index element={<NotificationIndexPage />} />
                  </Routes>
                </NotificationSettingsLayout>
              </PageContainer>
            }
          />
        </Route>
      </Routes>
    </Suspense>
  );
};
