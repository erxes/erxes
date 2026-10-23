import {
  IconAdjustmentsAlt,
  IconBuildingWarehouse,
  IconPackages,
} from '@tabler/icons-react';
import { NavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const SettingsNavigation = () => {
  const { t } = useTranslation('accounting');
  return (
    <Sidebar.Group>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>
          <NavigationMenuLinkItem
            name={t('accounting')}
            icon={IconAdjustmentsAlt}
            path="/config"
            pathPrefix="accounting/settings"
          />
          <NavigationMenuLinkItem
            name={t('fixed-asset')}
            icon={IconBuildingWarehouse}
            path="/fixed-assets"
            pathPrefix="accounting/settings"
          />
          <NavigationMenuLinkItem
            name={t('inventory')}
            icon={IconPackages}
            path="/inventories"
            pathPrefix="accounting/settings"
          />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
