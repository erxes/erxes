import {
  IconAdjustmentsAlt,
  IconBuildingWarehouse,
  IconPackages,
} from '@tabler/icons-react';
import { Sidebar } from 'erxes-ui';
import { NavigationSection } from '@/NavigationSection';
import {
  FIXED_ASSET_SETTINGS_ROUTES,
  INVENTORY_SETTINGS_ROUTES,
  SETTINGS_ROUTES,
} from '@/settings/constants/settingsRoutes';

export const SettingsNavigation = () => (
  <Sidebar.Group>
    <Sidebar.GroupContent className="pt-1">
      <Sidebar.Menu>
        <NavigationSection
          name="accounting"
          icon={IconAdjustmentsAlt}
          sectionPath="/accounting/settings/config"
          items={SETTINGS_ROUTES}
        />
        <NavigationSection
          name="fixed-asset"
          icon={IconBuildingWarehouse}
          sectionPath="/accounting/settings/fixed-assets"
          items={FIXED_ASSET_SETTINGS_ROUTES}
        />
        <NavigationSection
          name="inventory"
          icon={IconPackages}
          sectionPath="/accounting/settings/inventories"
          items={INVENTORY_SETTINGS_ROUTES}
        />
      </Sidebar.Menu>
    </Sidebar.GroupContent>
  </Sidebar.Group>
);
