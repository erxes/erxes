import { lazy } from 'react';
import { Route } from 'react-router';
import { PluginRoutesShell } from '~/components/PluginRoutesShell';

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
    <PluginRoutesShell defaultPath="agents">
      <Route path="/agents" element={<AgentsIndexPage />} />
      <Route path="/agents/new" element={<AgentFormPage />} />
      <Route path="/agents/edit/:id" element={<AgentFormPage />} />
      <Route path="/providers" element={<ProvidersPage />} />
      <Route path="/general" element={<GeneralSettingsPage />} />
    </PluginRoutesShell>
  );
};

export default MastraSettings;
