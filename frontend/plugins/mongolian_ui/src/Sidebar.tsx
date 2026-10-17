import { IconSettings } from '@tabler/icons-react';
import { AppLayoutFooterLink, Sidebar } from 'erxes-ui';
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
      path="settings/mongolian"
      name={t('app-settings')}
      icon={IconSettings}
    />
  );
};
