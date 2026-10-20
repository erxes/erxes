import { PluginSharedSettingsNavigation } from 'ui-modules';
import { SalesSettingsNavigation } from '@/SalesSettingsNavigation';
import type { ReactNode } from 'react';
import { IconSettings, IconArrowLeft } from '@tabler/icons-react';
import { AppLayoutFooterLink, Sidebar, AppLayout } from 'erxes-ui';
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
      path="sales/settings"
      name={t('app-settings')}
      icon={IconSettings}
    />
  );
};

/** The plugin's settings pages (`/sales/settings/*`) with their own sidebar. */
export const SalesSettingsLayout = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  return (
    <AppLayout
      id="sales:settings"
      title={t('plugin-settings-title', { name: 'Sales' })}
      sidebar={
        <>
          <SalesSettingsNavigation />
          <PluginSharedSettingsNavigation
            pluginName="sales"
            pathPrefix="sales/settings"
          />
        </>
      }
      footer={
        <AppLayoutFooterLink
          path="sales/deals"
          name={t('back-to-app', { name: 'Sales' })}
          icon={IconArrowLeft}
        />
      }
    >
      {children}
    </AppLayout>
  );
};
