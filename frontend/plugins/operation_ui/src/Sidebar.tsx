import { IconSettings } from '@tabler/icons-react';
import { AppLayoutFooterLink, Sidebar } from 'erxes-ui';
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
      path="settings/operation/team"
      name={t('app-settings')}
      icon={IconSettings}
    />
  );
};
