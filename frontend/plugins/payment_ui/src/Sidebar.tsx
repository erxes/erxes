import { PluginSharedSettingsNavigation } from 'ui-modules';
import {
  IconChevronLeft,
  IconFileInvoice,
  IconSettings,
} from '@tabler/icons-react';
import {
  AppLayout,
  AppLayoutFooterLink,
  NavigationMenuLinkItem,
  Sidebar,
} from 'erxes-ui';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PaymentSettingsNavigation } from '@/PaymentSettingsNavigation';

/** The plugin's own sidebar, rendered by its entry through `AppLayout`. */
export const PaymentSidebar = () => {
  const { t } = useTranslation('payment');

  return (
    <Sidebar.Group className="px-2 py-1">
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          <NavigationMenuLinkItem
            pathPrefix="payment"
            path="invoices"
            name={t('invoices')}
            icon={IconFileInvoice}
          />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};

/** Pinned to the bottom of the app sidebar: the plugin's own settings. */
export const PaymentSidebarFooter = () => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  return (
    <AppLayoutFooterLink
      path="payment/settings"
      name={t('app-settings')}
      icon={IconSettings}
    />
  );
};

/** The plugin's settings pages (`/payment/settings/*`) with their own sidebar. */
export const PaymentSettingsLayout = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const { t: tSidebar } = useTranslation('common', { keyPrefix: 'sidebar' });

  return (
    <AppLayout
      id="payment:settings"
      title={t('plugin-settings-title', { name: 'Payment' })}
      sidebar={
        <>
          <Sidebar.Header className="sticky top-0 z-10 bg-sidebar px-2 pt-0 pb-1 after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-4 after:bg-gradient-to-b after:from-sidebar after:to-transparent">
            <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Sidebar.MenuButton asChild>
                  <Link to="/payment/invoices">
                    <IconChevronLeft />
                    <span>{tSidebar('exit-settings')}</span>
                  </Link>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </Sidebar.Header>
          <PaymentSettingsNavigation />
          <PluginSharedSettingsNavigation
            pluginName="payment"
            pathPrefix="payment/settings"
          />
        </>
      }
    >
      {children}
    </AppLayout>
  );
};
