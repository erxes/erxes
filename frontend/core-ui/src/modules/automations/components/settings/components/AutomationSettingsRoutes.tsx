import { AutomationSettingsLayout } from '@/automations/components/settings/components/AutomationsSettingsLayout';
import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { AutomationBotDetailSettingsPage } from '~/pages/settings/workspace/automations/AutomationsBotDetailSettingsPage';

const AutomationsBotsSettingsPage = lazy(() =>
  import(
    '~/pages/settings/workspace/automations/AutomationsBotsSettingsPage'
  ).then((module) => ({ default: module.AutomationsBotsSettingsPage })),
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
      </Routes>
    </AutomationSettingsLayout>
  );
};
