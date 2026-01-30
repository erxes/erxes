import { SettingsNavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import { LoyaltySettingsPaths } from './types/settingsPaths';

export const LoyaltySettingsNavigation = () => {
  return (
    <Sidebar.Group>
      <Sidebar.GroupLabel className="h-4">Loyalty</Sidebar.GroupLabel>
      <Sidebar.GroupContent className="pt-1">
        <SettingsNavigationMenuLinkItem
          pathPrefix={LoyaltySettingsPaths.Loyalty}
          path={LoyaltySettingsPaths.Config}
          name="Configs"
        />
        <Sidebar.Menu>
          <SettingsNavigationMenuLinkItem
            pathPrefix={LoyaltySettingsPaths.Loyalty}
            path={LoyaltySettingsPaths.Pricing}
            name="Pricing"
          />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
