import { SettingsNavigationMenuLinkItem, Sidebar } from 'erxes-ui';

export const MastraSettingsNavigation = () => {
  return (
    <Sidebar.Group>
      <Sidebar.GroupLabel className="h-4">AI / Mastra</Sidebar.GroupLabel>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>
          <SettingsNavigationMenuLinkItem
            pathPrefix="mastra"
            path="/agents"
            name="Agents"
          />
          <SettingsNavigationMenuLinkItem
            pathPrefix="mastra"
            path="/tools"
            name="Tools"
          />
          <SettingsNavigationMenuLinkItem
            pathPrefix="mastra"
            path="/providers"
            name="Providers & Models"
          />
          <SettingsNavigationMenuLinkItem
            pathPrefix="mastra"
            path="/general"
            name="General Settings"
          />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
