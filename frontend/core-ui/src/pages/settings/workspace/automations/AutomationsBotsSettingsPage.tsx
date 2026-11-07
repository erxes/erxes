import { AutomationsBotsSettings } from '@/automations/components/settings/components/bots/components/AutomationsBotsSettings';
import { Suspense } from 'react';
import { Outlet } from 'react-router';

export const AutomationsBotsSettingsPage = () => {
  return (
    <>
      <AutomationsBotsSettings />
      <Suspense>
        <Outlet />
      </Suspense>
    </>
  );
};
