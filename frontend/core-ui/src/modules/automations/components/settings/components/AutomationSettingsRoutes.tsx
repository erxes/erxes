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

const AutomationEmailTemplatesSettingsPage = lazy(() =>
  import(
    '~/pages/settings/workspace/automations/AutomationEmailTemplatesSettingsPage'
  ).then((module) => ({
    default: module.AutomationEmailTemplatesSettingsPage,
  })),
);

const AutomationEmailTemplateDetailSettingsPage = lazy(() =>
  import(
    '~/pages/settings/workspace/automations/AutomationEmailTemplateDetailSettingsPage'
  ).then((module) => ({
    default: module.AutomationEmailTemplateDetailSettingsPage,
  })),
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
        />
        <Route
          path={AutomationSettingsRoutesPath.AgentDetail}
          element={<AutomationAiAgentDetailSettingsPage />}
        />
        <Route
          path={AutomationSettingsRoutesPath.AgentCreate}
          element={<AutomationAiAgentDetailSettingsPage />}
        />

        <Route
          path={AutomationSettingsRoutesPath.EmailTemplates}
          element={<AutomationEmailTemplatesSettingsPage />}
        />
        <Route
          path={AutomationSettingsRoutesPath.EmailTemplateDetail}
          element={<AutomationEmailTemplateDetailSettingsPage />}
        />
        <Route
          path={AutomationSettingsRoutesPath.EmailTemplateCreate}
          element={<AutomationEmailTemplateDetailSettingsPage />}
        />
      </Routes>
    </AutomationSettingsLayout>
  );
};
