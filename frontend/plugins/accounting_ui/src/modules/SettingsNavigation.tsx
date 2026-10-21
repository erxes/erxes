import { IconAdjustmentsAlt, IconBuildingWarehouse } from '@tabler/icons-react';
import { NavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PluginNavigationItem } from 'ui-modules';
import { FIXED_ASSET_SETTINGS_ROUTES } from '@/settings/constants/settingsRoutes';

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
          <PluginNavigationItem
            name={t('fixed-asset')}
            icon={IconBuildingWarehouse}
            path="fixed-assets"
            pathPrefix="accounting/settings"
            subPaths={Object.entries(FIXED_ASSET_SETTINGS_ROUTES).map(
              ([path, label]) => ({ name: t(label), path }),
            )}
          />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
