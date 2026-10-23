import { Navigate, Route, Routes } from 'react-router';

import { AgentSettingsAppearancePage } from './AgentSettingsAppearancePage';
import { AgentSettingsApprovalsPage } from './AgentSettingsApprovalsPage';
import { AgentSettingsCodeModePage } from './AgentSettingsCodeModePage';
import { AgentSettingsConnectionPage } from './AgentSettingsConnectionPage';

/**
 * Settings router for the agents module, mounted by the host settings
 * router at `/settings/agent/*`.
 */
export const AgentSettingsRoutes = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="connection" replace />} />
      <Route path="connection" element={<AgentSettingsConnectionPage />} />
      <Route path="code-mode" element={<AgentSettingsCodeModePage />} />
      <Route path="approvals" element={<AgentSettingsApprovalsPage />} />
      <Route path="appearance" element={<AgentSettingsAppearancePage />} />
    </Routes>
  );
};
