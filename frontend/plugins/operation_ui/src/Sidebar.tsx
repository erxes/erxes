import { PluginSharedSettingsNavigation } from 'ui-modules';
import { OperationSettingsNavigation } from '@/OperationSettingsNavigation';
import type { ReactNode } from 'react';
import { IconSettings, IconArrowLeft } from '@tabler/icons-react';
import { AppLayoutFooterLink, Sidebar, AppLayout } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { MainNavigation } from '@/navigation/MainNavigation';
import { TeamsNavigation } from '@/navigation/TeamsNavigation';

/** The plugin's own sidebar, rendered by its entry through `AppLayout`. */
export const OperationSidebar = () => (
  <>
    <Sidebar.Group className="px-2 py-1">
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          <MainNavigation />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
    <TeamsNavigation />
  </>
);

/** Pinned to the bottom of the app sidebar: the plugin's own settings. */
export const OperationSidebarFooter = () => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  return (
    <AppLayoutFooterLink
      path="operation/settings/team"
      name={t('app-settings')}
      icon={IconSettings}
    />
  );
};

/** The plugin's settings pages (`/operation/settings/*`) with their own sidebar. */
export const OperationSettingsLayout = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  return (
    <AppLayout
      id="operation:settings"
      title={t('plugin-settings-title', { name: 'Operation' })}
      sidebar={
        <>
          <OperationSettingsNavigation />
          <PluginSharedSettingsNavigation
            pluginName="operation"
            pathPrefix="operation/settings"
          />
        </>
      }
      footer={
        <AppLayoutFooterLink
          path="operation/projects"
          name={t('back-to-app', { name: 'Operation' })}
          icon={IconArrowLeft}
        />
      }
    >
      {children}
    </AppLayout>
  );
};
