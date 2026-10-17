import { IconSettings } from '@tabler/icons-react';
import { AppLayoutFooterLink, Sidebar } from 'erxes-ui';
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
      path="settings/frontline/channels"
      name={t('app-settings')}
      icon={IconSettings}
    />
  );
};
