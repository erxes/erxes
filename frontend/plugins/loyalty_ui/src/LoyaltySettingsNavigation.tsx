import { IconCoin } from '@tabler/icons-react';
import { NavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { LOYALTY_SETTINGS_PAGES } from '@/loyalties/settings/constants/settingRoutes';
import { LoyaltySettingsPaths } from './types/settingsPaths';

export const LoyaltySettingsNavigation = () => {
  const { t } = useTranslation('loyalty');
  return (
    <Sidebar.Group>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>
          {LOYALTY_SETTINGS_PAGES.map(({ path, label, icon }) => (
            <NavigationMenuLinkItem
              key={path}
              pathPrefix="loyalty/settings"
              path={`${LoyaltySettingsPaths.Config}/${path}`}
              name={t(label)}
              icon={icon}
            />
          ))}
          <NavigationMenuLinkItem
            pathPrefix="loyalty/settings"
            path={LoyaltySettingsPaths.Pricing}
            name={t('pricing')}
            icon={IconCoin}
          />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
