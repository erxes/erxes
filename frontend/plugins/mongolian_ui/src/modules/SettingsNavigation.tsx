import {
  IconCurrencyDollar,
  IconMapPin,
  IconPlugConnected,
  IconReceiptTax,
  IconRefresh,
} from '@tabler/icons-react';
import { SettingsNavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const SettingsNavigation = () => {
  const { t } = useTranslation('mongolian');
  return (
    <Sidebar.Group>
      <Sidebar.GroupLabel className="h-4">{t('mongolian')}</Sidebar.GroupLabel>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>
          <SettingsNavigationMenuLinkItem
            pathPrefix="mongolian"
            path="/ebarimt"
            name={t('ebarimt')}
            icon={IconReceiptTax}
          />
          <SettingsNavigationMenuLinkItem
            pathPrefix="mongolian"
            path="/sync-erkhet"
            name={t('erkhet')}
            icon={IconRefresh}
          />
          <SettingsNavigationMenuLinkItem
            pathPrefix="mongolian"
            path="/product-places"
            name={t('product-place')}
            icon={IconMapPin}
          />
          <SettingsNavigationMenuLinkItem
            pathPrefix="mongolian"
            path="/exchange-rates"
            name={t('exchange-rates-label')}
            icon={IconCurrencyDollar}
          />
          <SettingsNavigationMenuLinkItem
            pathPrefix="mongolian"
            path="/msdynamic"
            name={t('ms-dynamic')}
            icon={IconPlugConnected}
          />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
