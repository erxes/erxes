import { PluginSharedSettingsNavigation } from 'ui-modules';
import { FrontlineSettingsNavigation } from '@/FrontlineSettingsNavigation';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { IconSettings, IconChevronLeft } from '@tabler/icons-react';
import {
  AppLayoutFooterLink,
  Sidebar,
  AppLayout,
  useQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { FrontlineNavigation } from '@/FrontlineNavigation';
import { FrontlineSubGroups } from '@/FrontlineSubGroups';

/** The plugin's own sidebar, rendered by its entry through `AppLayout`. */
export const FrontlineSidebar = () => (
  <>
    <Sidebar.Group className="px-2 py-1">
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          <FrontlineNavigation />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
    <FrontlineSubGroups />
  </>
);

/** Pinned to the bottom of the app sidebar: the plugin's own settings. */
export const FrontlineSidebarFooter = () => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  return (
    <AppLayoutFooterLink
      path="frontline/settings/channels"
      name={t('app-settings')}
      icon={IconSettings}
    />
  );
};

/** The plugin's settings pages (`/frontline/settings/*`) with their own sidebar. */
export const FrontlineSettingsLayout = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const { t: tSidebar } = useTranslation('common', { keyPrefix: 'sidebar' });
  const [inPreview] = useQueryState<boolean>('inPreview');

  // Preview iframes (messenger, form) render bare, as core's DefaultLayout does.
  if (inPreview) {
    return <>{children}</>;
  }

  return (
    <AppLayout
      id="frontline:settings"
      title={t('plugin-settings-title', { name: 'Frontline' })}
      sidebar={
        <>
          <Sidebar.Header className="sticky top-0 z-10 bg-sidebar px-2 pt-0 pb-1 after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-4 after:bg-gradient-to-b after:from-sidebar after:to-transparent">
            <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Sidebar.MenuButton asChild>
                  <Link to="/frontline/inbox">
                    <IconChevronLeft />
                    <span>{tSidebar('exit-settings')}</span>
                  </Link>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </Sidebar.Header>
          <FrontlineSettingsNavigation />
          <PluginSharedSettingsNavigation
            pluginName="frontline"
            pathPrefix="frontline/settings"
          />
        </>
      }
    >
      {children}
    </AppLayout>
  );
};
