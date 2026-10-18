import { IconCashRegister, IconLayoutKanban } from '@tabler/icons-react';
import { NavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const SalesSettingsNavigation = () => {
  const { t } = useTranslation('sales');
  return (
    <Sidebar.Group>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>
          <NavigationMenuLinkItem
            pathPrefix="sales/settings"
            path="/deals"
            name={t('deals')}
            icon={IconLayoutKanban}
          />

          <NavigationMenuLinkItem
            pathPrefix="sales/settings"
            path="/pos"
            name={t('pos')}
            icon={IconCashRegister}
          />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
