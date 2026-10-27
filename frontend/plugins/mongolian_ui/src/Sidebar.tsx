import { PluginSharedSettingsNavigation } from 'ui-modules';
import { SettingsNavigation } from '@/SettingsNavigation';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { IconSettings, IconChevronLeft } from '@tabler/icons-react';
import { AppLayoutFooterLink, Sidebar, AppLayout, Button } from 'erxes-ui';
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
      title={
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-2 h-7 max-w-full gap-1 px-1.5 font-medium"
        >
          <Link
            to="/mongolian/put-response"
            title={t('back-to-app', { name: 'Mongolian' })}
          >
            <IconChevronLeft />
            <span className="truncate">
              {t('plugin-settings-title', { name: 'Mongolian' })}
            </span>
          </Link>
        </Button>
      }
      sidebar={
        <>
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
