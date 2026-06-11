import { SettingsNavigationMenuLinkItem, Sidebar } from 'erxes-ui';

export const MastraSettingsNavigation = () => {
  return (
    <Sidebar.Group>
      <Sidebar.GroupLabel className="h-4">AI / erxes Agent</Sidebar.GroupLabel>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>
          <SettingsNavigationMenuLinkItem
            pathPrefix="erxes-agent"
            path="/agents"
            name="Agents"
          />
          <SettingsNavigationMenuLinkItem
            pathPrefix="erxes-agent"
            path="/providers"
            name="Providers & Models"
          />
          <SettingsNavigationMenuLinkItem
            pathPrefix="erxes-agent"
            path="/general"
            name="General Settings"
          />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
