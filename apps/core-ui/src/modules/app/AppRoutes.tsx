import { Spinner } from 'erxes-ui';
import { Route, Routes } from 'react-router-dom';
import { PluginPage } from '~/modules/plugins/PluginPage';
import { SettingsRoutes } from '~/modules/settings/SettingsRoutes';
import { usePlugins } from '~/modules/plugins/usePlugins';
import { AutomationsRoutes } from '~/modules/automations/AutomationsRoutes';
import { ContactsRoutes } from '~/modules/contacts/ContactsRoutes';
import { ReportsRoutes } from '~/modules/reports/ReportsRoutes';
import { HomePage } from '~/modules/home/HomePage';
import { NotificationsPage } from '~/modules/notifications/NotificationsPage';
import { MainOnboardingPage } from '~/modules/onboarding/MainOnboardingPage';
import { OnboardingGuard } from '~/modules/onboarding/OnboardingGuard';
import { MainLayout } from './MainLayout';
import { NotFoundPage } from './NotFoundPage';

/** Plugin pages mount at `/<CONFIG.path>/*` once their config has loaded. */
const PluginRoutes = () => {
  const { plugins, loading } = usePlugins();

  return (
    <Routes>
      {plugins.map((plugin) => (
        <Route
          key={plugin.remote}
          path={`/${plugin.config.path.replace(/^\/+|\/+$/g, '')}/*`}
          element={<PluginPage key={plugin.remote} plugin={plugin} />}
        />
      ))}
      <Route
        path="*"
        element={
          loading ? (
            <div className="flex h-full items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <NotFoundPage />
          )
        }
      />
    </Routes>
  );
};

export const AppRoutes = () => (
  <Routes>
    {/* First sign-in steps, full screen. */}
    <Route path="welcome" element={<MainOnboardingPage />} />
    <Route
      element={
        <OnboardingGuard>
          <MainLayout />
        </OnboardingGuard>
      }
    >
      <Route index element={<HomePage />} />
      <Route path="contacts/*" element={<ContactsRoutes notFound={<NotFoundPage />} />} />
      <Route path="automations/*" element={<AutomationsRoutes />} />
      <Route path="reports/*" element={<ReportsRoutes />} />
      <Route path="settings/*" element={<SettingsRoutes />} />
      <Route path="notifications" element={<NotificationsPage />} />
      <Route path="notifications/:source" element={<NotificationsPage />} />
      <Route path="*" element={<PluginRoutes />} />
    </Route>
  </Routes>
);
