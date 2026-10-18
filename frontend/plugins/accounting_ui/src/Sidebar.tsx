import { IconSettings } from '@tabler/icons-react';
import { AppLayoutFooterLink, Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { AdjustmentNavigation } from '@/AdjustmentNavigation';
import { InventoriesNavigation } from '@/InventoriesNavigation';
import { JournalNavigation } from '@/JournalNavigation';
import { MainNavigation } from '@/MainNavigation';
import { CheckSyncNavigation } from '@/check-synced/components/CheckSyncNavigation';
import { FixedAssetsNavigation } from '@/fixedAssets/FixedAssetsNavigation';

/** The plugin's own sidebar, rendered by its entry through `AppLayout`. */
export const AccountingSidebar = () => (
  <>
    <Sidebar.Group className="px-2 py-1">
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          <MainNavigation />
          <AdjustmentNavigation />
          <InventoriesNavigation />
          <FixedAssetsNavigation />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
    <JournalNavigation />
    <CheckSyncNavigation />
  </>
);

/** Pinned to the bottom of the app sidebar: the plugin's own settings. */
export const AccountingSidebarFooter = () => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  return (
    <AppLayoutFooterLink
      path="settings/accounting/config"
      name={t('app-settings')}
      icon={IconSettings}
    />
  );
};
