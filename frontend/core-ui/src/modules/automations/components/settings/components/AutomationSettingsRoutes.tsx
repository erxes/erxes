import { AutomationSettingsLayout } from '@/automations/components/settings/components/AutomationsSettingsLayout';
import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router';

const AutomationsBotsSettingsPage = lazy(() =>
  import(
    '~/pages/settings/workspace/automations/AutomationsBotsSettingsPage'
  ).then((module) => ({ default: module.AutomationsBotsSettingsPage })),
);

const AutomationBotDetailSettingsPage = lazy(() =>
  import(
    '~/pages/settings/workspace/automations/AutomationsBotDetailSettingsPage'
  ).then((module) => ({ default: module.AutomationBotDetailSettingsPage })),
);

const AutomationAiAgentDetailSettingsPage = lazy(() =>
  import(
    '~/pages/settings/workspace/automations/AutomationAiAgentDetailSettingsPage'
  ).then((module) => ({ default: module.AutomationAiAgentDetailSettingsPage })),
);
const AutomationAiAgentsSettingsPage = lazy(() =>
  import(
    '~/pages/settings/workspace/automations/AutomationAiAgentsSettingsPage'
  ).then((module) => ({ default: module.AutomationAiAgentsSettingsPage })),
);

export const AutomationSettingsRoutes = () => {
  return (
    <AutomationSettingsLayout>
      <Routes>
        <Route path="/" element={<Navigate to="bots" replace />} />
        <Route path="/bots" element={<AutomationsBotsSettingsPage />} />
        <Route
          path="/bots/:type"
          element={<AutomationBotDetailSettingsPage />}
        />

        <Route path="/agents" element={<AutomationAiAgentsSettingsPage />} />
        <Route
          path="/agents/:id"
          element={<AutomationAiAgentDetailSettingsPage />}
        />
        <Route
          path="/agents/create"
          element={<AutomationAiAgentDetailSettingsPage />}
        />
      </Routes>
    </AutomationSettingsLayout>
  );
};
