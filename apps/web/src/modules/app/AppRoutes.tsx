import { Navigate, Route, Routes } from 'react-router-dom';
import { PageSpinner } from '~/components/PageSpinner';
import { i18n } from '~/i18n';
import { lazyNamed } from '~/lib/lazyNamed';
import { paths } from '~/lib/paths';
import { pluginBasePath } from '~/modules/plugins/pluginConfig';
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

const ProductsRoutes = lazyNamed(
  () => import('~/modules/products/ProductsRoutes'),
  'ProductsRoutes',
);

const AutomationsRoutes = lazyNamed(
  () => import('~/modules/automations/AutomationsRoutes'),
  'AutomationsRoutes',
);

const BroadcastsRoutes = lazyNamed(
  () => import('~/modules/broadcasts/BroadcastsRoutes'),
  'BroadcastsRoutes',
);

const ReportsRoutes = lazyNamed(() => import('~/modules/reports/ReportsRoutes'), 'ReportsRoutes');

const ConnectAppPage = lazyNamed(() => import('~/modules/auth/ConnectAppPage'), 'ConnectAppPage');

// The settings pages' words load beside their code, so they never show untranslated.
const SettingsRoutes = lazyNamed(async () => {
  const [routes] = await Promise.all([
    import('~/modules/settings/SettingsRoutes'),
    i18n.loadNamespaces('settings'),
  ]);

  return routes;
}, 'SettingsRoutes');

const AssistantPage = lazyNamed(() => import('~/modules/assistant/AssistantPage'), 'AssistantPage');

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
          path={`${pluginBasePath(plugin.config.path)}/*`}
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
    {/* An app asking to act as the member: full screen, before onboarding too. */}
    <Route path="connect" element={<ConnectAppPage />} />
    {/* The module's name, so the URL people guess goes there too. */}
    <Route path="onboarding" element={<Navigate to={paths.welcome} replace />} />
    <Route
      element={
        <OnboardingGuard>
          <MainLayout />
        </OnboardingGuard>
      }
    >
      <Route index element={<HomePage />} />
      <Route path="contacts/*" element={<ContactsRoutes notFound={<NotFoundPage />} />} />
      <Route path="products/*" element={<ProductsRoutes notFound={<NotFoundPage />} />} />
      <Route path="automations/*" element={<AutomationsRoutes />} />
      <Route path="broadcasts/*" element={<BroadcastsRoutes />} />
      <Route path="reports/*" element={<ReportsRoutes />} />
      <Route path="settings/*" element={<SettingsRoutes />} />
      <Route path="assistant" element={<AssistantPage />} />
      <Route path="notifications" element={<NotificationsPage />} />
      <Route path="notifications/:source" element={<NotificationsPage />} />
      <Route path="*" element={<PluginRoutes />} />
    </Route>
  </Routes>
);
