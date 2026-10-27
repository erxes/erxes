import { PluginSharedSettingsNavigation } from 'ui-modules';
import { OperationSettingsNavigation } from '@/OperationSettingsNavigation';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { IconSettings, IconChevronLeft } from '@tabler/icons-react';
import { AppLayoutFooterLink, Sidebar, AppLayout, Button } from 'erxes-ui';
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
      title={
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-2 h-7 max-w-full gap-1 px-1.5 font-medium"
        >
          <Link
            to="/operation/projects"
            title={t('back-to-app', { name: 'Operation' })}
          >
            <IconChevronLeft />
            <span className="truncate">
              {t('plugin-settings-title', { name: 'Operation' })}
            </span>
          </Link>
        </Button>
      }
      sidebar={
        <>
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
