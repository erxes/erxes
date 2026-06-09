import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const ProvidersPage = lazy(() =>
  import('~/pages/settings/ProvidersPage').then((m) => ({ default: m.ProvidersPage })),
);

const GeneralSettingsPage = lazy(() =>
  import('~/pages/settings/GeneralSettingsPage').then((m) => ({ default: m.GeneralSettingsPage })),
);

const AgentsIndexPage = lazy(() =>
  import('~/pages/agents/AgentsIndexPage').then((m) => ({ default: m.AgentsIndexPage })),
);

const AgentFormPage = lazy(() =>
  import('~/pages/agents/AgentFormPage').then((m) => ({ default: m.AgentFormPage })),
);

const ToolsIndexPage = lazy(() =>
  import('~/pages/tools/ToolsIndexPage').then((m) => ({ default: m.ToolsIndexPage })),
);

const ToolFormPage = lazy(() =>
  import('~/pages/tools/ToolFormPage').then((m) => ({ default: m.ToolFormPage })),
);

const MastraSettings = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/agents" element={<AgentsIndexPage />} />
        <Route path="/agents/new" element={<AgentFormPage />} />
        <Route path="/agents/edit/:id" element={<AgentFormPage />} />
        <Route path="/tools" element={<ToolsIndexPage />} />
        <Route path="/tools/new" element={<ToolFormPage />} />
        <Route path="/tools/edit/:id" element={<ToolFormPage />} />
        <Route path="/providers" element={<ProvidersPage />} />
        <Route path="/general" element={<GeneralSettingsPage />} />
      </Routes>
    </Suspense>
  );
};

export default MastraSettings;
