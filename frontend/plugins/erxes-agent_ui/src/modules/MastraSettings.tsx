import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { Spinner } from 'erxes-ui';
import { PluginErrorBoundary } from '~/components/PluginErrorBoundary';

const ProvidersPage = lazy(() =>
  import('~/pages/settings/ProvidersPage').then((m) => ({
    default: m.ProvidersPage,
  })),
);

const GeneralSettingsPage = lazy(() =>
  import('~/pages/settings/GeneralSettingsPage').then((m) => ({
    default: m.GeneralSettingsPage,
  })),
);

const AgentsIndexPage = lazy(() =>
  import('~/pages/agents/AgentsIndexPage').then((m) => ({
    default: m.AgentsIndexPage,
  })),
);

const AgentFormPage = lazy(() =>
  import('~/pages/agents/AgentFormPage').then((m) => ({
    default: m.AgentFormPage,
  })),
);

const MastraSettings = () => {
  return (
    <PluginErrorBoundary>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route index element={<Navigate to="agents" replace />} />
          <Route path="/agents" element={<AgentsIndexPage />} />
          <Route path="/agents/new" element={<AgentFormPage />} />
          <Route path="/agents/edit/:id" element={<AgentFormPage />} />
          <Route path="/providers" element={<ProvidersPage />} />
          <Route path="/general" element={<GeneralSettingsPage />} />
          <Route path="*" element={<Navigate to="agents" replace />} />
        </Routes>
      </Suspense>
    </PluginErrorBoundary>
  );
};

export default MastraSettings;
