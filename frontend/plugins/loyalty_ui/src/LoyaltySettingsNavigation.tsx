import { SettingsNavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { LoyaltySettingsPaths } from './types/settingsPaths';

export const LoyaltySettingsNavigation = () => {
  const { t } = useTranslation('loyalty');
  return (
    <Sidebar.Group>
      <Sidebar.GroupLabel className="h-4">Loyalty</Sidebar.GroupLabel>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>
          <SettingsNavigationMenuLinkItem
            pathPrefix={LoyaltySettingsPaths.Loyalty}
            path={LoyaltySettingsPaths.Config}
            name={t('configs')}
          />
          <SettingsNavigationMenuLinkItem
            pathPrefix={LoyaltySettingsPaths.Loyalty}
            path={LoyaltySettingsPaths.Pricing}
            name={t('pricing')}
          />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
