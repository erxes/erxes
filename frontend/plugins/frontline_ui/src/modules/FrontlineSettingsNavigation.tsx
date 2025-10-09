import { FrontlinePaths } from '@/types/FrontlinePaths';
import { SettingsNavigationMenuLinkItem, Sidebar } from 'erxes-ui';

export const FrontlineSettingsNavigation = () => {
  return (
    <Sidebar.Group>
      <Sidebar.GroupLabel className="h-4">Frontline</Sidebar.GroupLabel>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>
          <SettingsNavigationMenuLinkItem
            pathPrefix={FrontlinePaths.Frontline + '/' + FrontlinePaths.Inbox}
            path={FrontlinePaths.Integrations}
            name="Integrations"
          />
          <SettingsNavigationMenuLinkItem
            pathPrefix={FrontlinePaths.Frontline + '/' + FrontlinePaths.Inbox}
            path={FrontlinePaths.IntegrationConfig}
            name="Integrations Config"
          />
          <SettingsNavigationMenuLinkItem
            pathPrefix={FrontlinePaths.Frontline + '/' + FrontlinePaths.Inbox}
            path={FrontlinePaths.Channels}
            name="Channels"
          />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
