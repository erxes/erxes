import { PluginSharedSettingsNavigation } from 'ui-modules';
import { SettingsNavigation } from '@/SettingsNavigation';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { IconSettings, IconChevronLeft } from '@tabler/icons-react';
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
  const { t: tSidebar } = useTranslation('common', { keyPrefix: 'sidebar' });

  return (
    <AppLayout
      id="mongolian:settings"
      title={t('plugin-settings-title', { name: 'Mongolian' })}
      sidebar={
        <>
          <Sidebar.Header className="sticky top-0 z-10 bg-sidebar px-2 pt-0 pb-1 after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-4 after:bg-gradient-to-b after:from-sidebar after:to-transparent">
            <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Sidebar.MenuButton asChild>
                  <Link to="/mongolian/put-response">
                    <IconChevronLeft />
                    <span>{tSidebar('exit-settings')}</span>
                  </Link>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </Sidebar.Header>
          <SettingsNavigation />
          <PluginSharedSettingsNavigation
            pluginName="mongolian"
            pathPrefix="mongolian/settings"
          />
        </>
      }
    >
      {children}
    </AppLayout>
  );
};
