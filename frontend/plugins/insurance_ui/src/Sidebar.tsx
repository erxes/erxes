import { PluginSharedSettingsNavigation } from 'ui-modules';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconSettings, IconChevronLeft } from '@tabler/icons-react';
import {
  Sidebar,
  AppLayoutFooterLink,
  NavigationMenuLinkItem,
  AppLayout,
} from 'erxes-ui';
import { InsuranceNavigation } from '@/InsuranceNavigation';

/** The plugin's own sidebar, rendered by its entry through `AppLayout`. */
export const InsuranceSidebar = () => (
  <Sidebar.Group className="px-2 py-1">
    <Sidebar.GroupContent>
      <Sidebar.Menu>
        <InsuranceNavigation />
      </Sidebar.Menu>
    </Sidebar.GroupContent>
  </Sidebar.Group>
);

/** Pinned to the bottom of the app sidebar: the plugin's own settings. */
export const InsuranceSidebarFooter = () => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  return (
    <AppLayoutFooterLink
      path="insurance/settings"
      name={t('app-settings')}
      icon={IconSettings}
    />
  );
};

/** The insurance settings menu (a single page). */
const InsuranceSettingsNavigation = () => {
  const { t } = useTranslation('insurance');

  return (
    <Sidebar.Group>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>
          <NavigationMenuLinkItem
            pathPrefix="insurance"
            path="settings"
            name={t('insurance-settings')}
            icon={IconSettings}
          />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};

/** The plugin's settings pages (`/insurance/settings/*`) with their own sidebar. */
export const InsuranceSettingsLayout = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const { t: tSidebar } = useTranslation('common', { keyPrefix: 'sidebar' });

  return (
    <AppLayout
      id="insurance:settings"
      title={t('plugin-settings-title', { name: 'Insurance' })}
      sidebar={
        <>
          <Sidebar.Header className="sticky top-0 z-10 bg-sidebar px-2 pt-0 pb-1 after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-4 after:bg-gradient-to-b after:from-sidebar after:to-transparent">
            <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Sidebar.MenuButton asChild>
                  <Link to="/insurance/types">
                    <IconChevronLeft />
                    <span>{tSidebar('exit-settings')}</span>
                  </Link>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </Sidebar.Header>
          <InsuranceSettingsNavigation />
          <PluginSharedSettingsNavigation
            pluginName="insurance"
            pathPrefix="insurance/settings"
          />
        </>
      }
    >
      {children}
    </AppLayout>
  );
};
