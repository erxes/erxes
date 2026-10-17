import { IconArrowLeft, IconSettings } from '@tabler/icons-react';
import { AppLayout, AppLayoutFooterLink, Sidebar } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsNavigation } from '@/SettingsNavigation';
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

/** The plugin's settings pages with its own settings sidebar. */
export const AccountingSettingsLayout = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  return (
    <AppLayout
      id="accounting:settings"
      title={t('app-settings')}
      sidebar={<SettingsNavigation />}
      footer={
        <AppLayoutFooterLink
          path="accounting/main"
          name={t('back-to-app', { name: 'Accounting' })}
          icon={IconArrowLeft}
        />
      }
    >
      {children}
    </AppLayout>
  );
};
