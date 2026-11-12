import { Route, Routes } from 'react-router-dom';
import { PageSpinner } from '~/components/PageSpinner';
import { lazyNamed } from '~/lib/lazyNamed';
import { usePlugins } from '~/modules/plugins/usePlugins';
import { OnboardingGuard } from '~/modules/onboarding/OnboardingGuard';
import { MainLayout } from './MainLayout';
import { NotFoundPage } from './NotFoundPage';

// Every page is its own chunk, fetched the first time it opens.
const HomePage = lazyNamed(() => import('~/modules/home/HomePage'), 'HomePage');

const ContactsRoutes = lazyNamed(
  () => import('~/modules/contacts/ContactsRoutes'),
  'ContactsRoutes',
);

const AutomationsRoutes = lazyNamed(
  () => import('~/modules/automations/AutomationsRoutes'),
  'AutomationsRoutes',
);

const ReportsRoutes = lazyNamed(() => import('~/modules/reports/ReportsRoutes'), 'ReportsRoutes');

const SettingsRoutes = lazyNamed(
  () => import('~/modules/settings/SettingsRoutes'),
  'SettingsRoutes',
);

const NotificationsPage = lazyNamed(
  () => import('~/modules/notifications/NotificationsPage'),
  'NotificationsPage',
);

const MainOnboardingPage = lazyNamed(
  () => import('~/modules/onboarding/MainOnboardingPage'),
  'MainOnboardingPage',
);

const PluginPage = lazyNamed(() => import('~/modules/plugins/PluginPage'), 'PluginPage');

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
      <Route path="*" element={loading ? <PageSpinner /> : <NotFoundPage />} />
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
