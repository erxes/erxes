import { FrontlinePaths } from '@/types/FrontlinePaths';
import { SettingsNavigationMenuLinkItem, Sidebar } from 'erxes-ui';

export const FrontlineSettingsNavigation = () => {
  return (
    <Sidebar.Group>
      <Sidebar.GroupLabel className="h-4">Frontline</Sidebar.GroupLabel>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>
          <SettingsNavigationMenuLinkItem
            pathPrefix={FrontlinePaths.Frontline}
            path={FrontlinePaths.Channels}
            name="Channels"
          />

          <SettingsNavigationMenuLinkItem
            pathPrefix={FrontlinePaths.Frontline}
            path={FrontlinePaths.IntegrationConfig}
            name="Integrations Config"
          />
          <SettingsNavigationMenuLinkItem
            pathPrefix={FrontlinePaths.Frontline}
            path={FrontlinePaths.TicketTags}
            name="Ticket Tags"
          />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
