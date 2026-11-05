import { PluginSharedSettingsNavigation } from 'ui-modules';
import { OperationSettingsNavigation } from '@/OperationSettingsNavigation';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { IconSettings, IconChevronLeft } from '@tabler/icons-react';
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
  const { t: tSidebar } = useTranslation('common', { keyPrefix: 'sidebar' });

  return (
    <AppLayout
      id="operation:settings"
      title={t('plugin-settings-title', { name: 'Operation' })}
      sidebar={
        <>
          <Sidebar.Header className="sticky top-0 z-10 bg-sidebar px-2 pt-0 pb-1 after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-4 after:bg-gradient-to-b after:from-sidebar after:to-transparent">
            <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Sidebar.MenuButton asChild>
                  <Link to="/operation/projects">
                    <IconChevronLeft />
                    <span>{tSidebar('exit-settings')}</span>
                  </Link>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </Sidebar.Header>
          <OperationSettingsNavigation />
          <PluginSharedSettingsNavigation
            pluginName="operation"
            pathPrefix="operation/settings"
          />
        </>
      }
    >
      {children}
    </AppLayout>
  );
};
