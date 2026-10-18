import { AppLayout, AppLayoutFooterLink } from 'erxes-ui';
import { IconArrowLeft } from '@tabler/icons-react';
import { PluginSharedSettingsNavigation } from '@/settings/components/PluginSharedSettingsNavigation';
import type { ReactNode } from 'react';
import { TPluginSettingsApp } from '@/navigation/hooks/usePluginSettingsActivity';
import { useTranslation } from 'react-i18next';

/**
 * A plugin's own settings: its settings navigation, plus the organization
 * settings it uses (tags, properties) filtered to it, and a way back to the
 * app. Same layout id as before so the stored width/open state carries over.
 */
export const PluginSettingsLayout = ({
  app: { activity, plugin },
  children,
}: {
  app: TPluginSettingsApp;
  children: ReactNode;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const SettingsNavigation = plugin.settingsNavigation;

  return (
    <AppLayout
      id={`${plugin.name}:settings`}
      title={t('plugin-settings-title', { name: activity.label })}
      sidebar={
        <>
          {SettingsNavigation && <SettingsNavigation />}
          <PluginSharedSettingsNavigation plugin={plugin} />
        </>
      }
      footer={
        <AppLayoutFooterLink
          path={activity.defaultPath}
          name={t('back-to-app', { name: activity.label })}
          icon={IconArrowLeft}
        />
      }
    >
      {children}
    </AppLayout>
  );
};
