import { IconCoin } from '@tabler/icons-react';
import { SettingsNavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { LOYALTY_SETTINGS_PAGES } from '@/loyalties/settings/constants/settingRoutes';
import { LoyaltySettingsPaths } from './types/settingsPaths';

export const LoyaltySettingsNavigation = () => {
  const { t } = useTranslation('loyalty');
  return (
    <Sidebar.Group>
      <Sidebar.GroupLabel className="h-4">Loyalty</Sidebar.GroupLabel>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>
          {LOYALTY_SETTINGS_PAGES.map(({ path, label, icon }) => (
            <SettingsNavigationMenuLinkItem
              key={path}
              pathPrefix={LoyaltySettingsPaths.Loyalty}
              path={`${LoyaltySettingsPaths.Config}/${path}`}
              name={t(label)}
              icon={icon}
            />
          ))}
          <SettingsNavigationMenuLinkItem
            pathPrefix={LoyaltySettingsPaths.Loyalty}
            path={LoyaltySettingsPaths.Pricing}
            name={t('pricing')}
            icon={IconCoin}
          />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
