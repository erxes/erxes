import {
  IconCurrencyDollar,
  IconMapPin,
  IconPlugConnected,
  IconReceiptTax,
  IconRefresh,
} from '@tabler/icons-react';
import { NavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PluginNavigationItem } from 'ui-modules';
import { PRODUCT_PLACES_SETTINGS_ROUTES } from '@/productplaces/constants/settingRoutes';

export const SettingsNavigation = () => {
  const { t } = useTranslation('mongolian');
  return (
    <Sidebar.Group>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>
          <NavigationMenuLinkItem
            pathPrefix="mongolian/settings"
            path="/ebarimt"
            name={t('ebarimt')}
            icon={IconReceiptTax}
          />
          <NavigationMenuLinkItem
            pathPrefix="mongolian/settings"
            path="/sync-erkhet"
            name={t('erkhet')}
            icon={IconRefresh}
          />
          <PluginNavigationItem
            pathPrefix="mongolian/settings"
            path="product-places"
            name={t('product-place')}
            icon={IconMapPin}
            subPaths={Object.entries(PRODUCT_PLACES_SETTINGS_ROUTES).map(
              ([path, label]) => ({ name: t(label), path }),
            )}
          />
          <NavigationMenuLinkItem
            pathPrefix="mongolian/settings"
            path="/exchange-rates"
            name={t('exchange-rates-label')}
            icon={IconCurrencyDollar}
          />
          <NavigationMenuLinkItem
            pathPrefix="mongolian/settings"
            path="/msdynamic"
            name={t('ms-dynamic')}
            icon={IconPlugConnected}
          />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
