import { PluginSharedSettingsNavigation } from 'ui-modules';
import { SettingsNavigation } from '@/SettingsNavigation';
import type { ReactNode } from 'react';
import { IconSettings, IconArrowLeft } from '@tabler/icons-react';
import { AppLayoutFooterLink, Sidebar, AppLayout } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { MainNavigation } from '@/MainNavigation';

/** The plugin's own sidebar, rendered by its entry through `AppLayout`. */
export const MongolianSidebar = () => (
  <Sidebar.Group className="px-2 py-1">
    <Sidebar.GroupContent>
      <Sidebar.Menu>
        <MainNavigation />
      </Sidebar.Menu>
    </Sidebar.GroupContent>
  </Sidebar.Group>
);

/** Pinned to the bottom of the app sidebar: the plugin's own settings. */
export const MongolianSidebarFooter = () => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  return (
    <AppLayoutFooterLink
      path="mongolian/settings"
      name={t('app-settings')}
      icon={IconSettings}
    />
  );
};

/** The plugin's settings pages (`/mongolian/settings/*`) with their own sidebar. */
export const MongolianSettingsLayout = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  return (
    <AppLayout
      id="mongolian:settings"
      title={t('plugin-settings-title', { name: 'Mongolian' })}
      sidebar={
        <>
          <SettingsNavigation />
          <PluginSharedSettingsNavigation
            pluginName="mongolian"
            pathPrefix="mongolian/settings"
          />
        </>
      }
      footer={
        <AppLayoutFooterLink
          path="mongolian/put-response"
          name={t('back-to-app', { name: 'Mongolian' })}
          icon={IconArrowLeft}
        />
      }
    >
      {children}
    </AppLayout>
  );
};
