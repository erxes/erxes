import { AutomationSettingsLayout } from '@/automations/components/settings/components/AutomationsSettingsLayout';
import {
  AutomationSettingsPath,
  AutomationSettingsRoutesPath,
} from '@/types/paths/AutomationPath';
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

const AutomationAiAgentDetailSheet = lazy(() =>
  import(
    '@/automations/components/settings/components/agents/components/AutomationAiAgentDetailSheet'
  ).then((module) => ({ default: module.AutomationAiAgentDetailSheet })),
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
        <Route
          path="/"
          element={<Navigate to={AutomationSettingsPath.Agents} replace />}
        />
        <Route
          path={AutomationSettingsRoutesPath.Bots}
          element={<AutomationsBotsSettingsPage />}
        />
        <Route
          path={AutomationSettingsRoutesPath.BotDetail}
          element={<AutomationBotDetailSettingsPage />}
        />

        <Route
          path={AutomationSettingsRoutesPath.Agents}
          element={<AutomationAiAgentsSettingsPage />}
        >
          <Route path="create" element={<AutomationAiAgentDetailSheet />} />
          <Route path=":id" element={<AutomationAiAgentDetailSheet />} />
        </Route>

      </Routes>
    </AutomationSettingsLayout>
  );
};
