import { SettingsPath } from '@/types/paths/SettingsPath';
import { PageContainer } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { NotificationMobilePushConfig } from './NotificationMobilePushConfig';
import { NotificationSettingsLayout } from './NotificationSettingsLayout';

const NotificationIndexPage = lazy(() =>
  import('~/pages/settings/account/notification/NotificationIndexPage').then(
    (module) => ({
      default: module.NotificationIndexPage,
    }),
  ),
);

const NotificationTemplatesPage = lazy(() =>
  import(
    '~/pages/settings/account/notification/NotificationTemplatesPage'
  ).then((module) => ({ default: module.NotificationTemplatesPage })),
);

const NotificationTemplateEditorPage = lazy(() =>
  import(
    '~/pages/settings/account/notification/NotificationTemplateEditorPage'
  ).then((module) => ({ default: module.NotificationTemplateEditorPage })),
);

const NotificationEmailBrandPage = lazy(() =>
  import(
    '~/pages/settings/account/notification/NotificationEmailBrandPage'
  ).then((module) => ({ default: module.NotificationEmailBrandPage })),
);

export const NotificationSettingsRoutes = () => {
  return (
    <Suspense fallback={<></>}>
      <Routes>
        <Route
          element={
            <PageContainer>
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
            path="/config"
            element={
              <PageContainer>
                <NotificationSettingsLayout>
                  <NotificationMobilePushConfig />
                </NotificationSettingsLayout>
              </PageContainer>
            }
          />
          <Route
            path="/templates"
            element={
              <PageContainer>
                <NotificationSettingsLayout>
                  <NotificationTemplatesPage />
                </NotificationSettingsLayout>
              </PageContainer>
            }
          />
          {/* the editor needs the whole width, so it leaves the settings sidebar */}
          <Route
            path="/templates/:key"
            element={
              <PageContainer>
                <NotificationTemplateEditorPage />
              </PageContainer>
            }
          />
          <Route
            path="/brand"
            element={
              <PageContainer>
                <NotificationSettingsLayout>
                  <NotificationEmailBrandPage />
                </NotificationSettingsLayout>
              </PageContainer>
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
