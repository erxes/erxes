import { PluginSharedSettingsNavigation } from 'ui-modules';
import { SettingsNavigation } from '@/SettingsNavigation';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { IconSettings, IconChevronLeft } from '@tabler/icons-react';
import { AppLayoutFooterLink, Sidebar, AppLayout, Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { AdjustmentNavigation } from '@/AdjustmentNavigation';
import { InventoriesNavigation } from '@/InventoriesNavigation';
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
    <CheckSyncNavigation />
  </>
);

/** Pinned to the bottom of the app sidebar: the plugin's own settings. */
export const AccountingSidebarFooter = () => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  return (
    <AppLayoutFooterLink
      path="accounting/settings/config"
      name={t('app-settings')}
      icon={IconSettings}
    />
  );
};

/** The plugin's settings pages (`/accounting/settings/*`) with their own sidebar. */
export const AccountingSettingsLayout = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  return (
    <AppLayout
      id="accounting:settings"
      title={
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-2 h-7 max-w-full gap-1 px-1.5 font-medium"
        >
          <Link
            to="/accounting/main"
            title={t('back-to-app', { name: 'Accounting' })}
          >
            <IconChevronLeft />
            <span className="truncate">
              {t('plugin-settings-title', { name: 'Accounting' })}
            </span>
          </Link>
        </Button>
      }
      sidebar={
        <>
          <SettingsNavigation />
          <PluginSharedSettingsNavigation
            pluginName="accounting"
            pathPrefix="accounting/settings"
          />
        </>
      }
    >
      {children}
    </AppLayout>
  );
};
