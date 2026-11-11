import { AppLayout } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { SettingsSidebar, useSettingsEntry } from './components/SettingsSidebar';

/** Organization settings (the gear in the top bar), with old core-ui's settings sidebar and title. */
export const SettingsLayout = () => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  useSettingsEntry();

  return (
    <AppLayout id="settings" title={t('organization-settings')} sidebar={<SettingsSidebar />}>
      <Outlet />
    </AppLayout>
  );
};
