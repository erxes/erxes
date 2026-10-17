import { IconSettings } from '@tabler/icons-react';
import { AppLayoutFooterLink, Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { MainNavigation } from '@/MainNavigation';
import { SalesSubNavigation } from '@/SalesSubNavigation';
import { PosOrderNavigation } from '@/pos/PosOrderNavigation';

/** The plugin's own sidebar, rendered by its entry through `AppLayout`. */
export const SalesSidebar = () => (
  <>
    <Sidebar.Group className="px-2 py-1">
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          <MainNavigation />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
    <SalesSubNavigation />
    <PosOrderNavigation />
  </>
);

/** Pinned to the bottom of the app sidebar: the plugin's own settings. */
export const SalesSidebarFooter = () => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  return (
    <AppLayoutFooterLink
      path="settings/sales"
      name={t('app-settings')}
      icon={IconSettings}
    />
  );
};
