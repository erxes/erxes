import { AppLayout } from 'erxes-ui';
import { Outlet } from 'react-router-dom';
import { SettingsSidebar, useSettingsEntry } from './components/SettingsSidebar';

/** Organization settings (the gear in the top bar), with old core-ui's settings sidebar. */
export const SettingsLayout = () => {
  useSettingsEntry();

  return (
    <AppLayout id="settings" sidebar={<SettingsSidebar />}>
      <Outlet />
    </AppLayout>
  );
};
