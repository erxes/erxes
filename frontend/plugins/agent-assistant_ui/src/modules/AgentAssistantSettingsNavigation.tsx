
import { SettingsNavigationMenuLinkItem, Sidebar } from 'erxes-ui';

export const AgentAssistantSettingsNavigation = () => {
  return (
    <Sidebar.Group>
      <Sidebar.GroupLabel className="h-4">agent-assistant</Sidebar.GroupLabel>
      <Sidebar.GroupContent className="pt-1">
        <Sidebar.Menu>
          <SettingsNavigationMenuLinkItem
            pathPrefix="agent-assistant"
            path="agent-assistant"
            name="agent-assistant"
          />
          
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
