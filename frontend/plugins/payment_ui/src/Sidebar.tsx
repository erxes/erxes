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
  Button,
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

  return (
    <AppLayout
      id="payment:settings"
      title={
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-2 h-7 max-w-full gap-1 px-1.5 font-medium"
        >
          <Link
            to="/payment/invoices"
            title={t('back-to-app', { name: 'Payment' })}
          >
            <IconChevronLeft />
            <span className="truncate">
              {t('plugin-settings-title', { name: 'Payment' })}
            </span>
          </Link>
        </Button>
      }
      sidebar={
        <>
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
