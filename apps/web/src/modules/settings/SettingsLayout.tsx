import { AppLayout } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PageOutlet } from '~/components/CrashBoundary';
import { SettingsSidebar, useSettingsEntry } from './components/SettingsSidebar';

/** Organization settings (the gear in the top bar), with the settings sidebar and title. */
export const SettingsLayout = () => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  useSettingsEntry();

  return (
    <AppLayout id="settings" title={t('organization-settings')} sidebar={<SettingsSidebar />}>
      <PageOutlet />
    </AppLayout>
  );
};
