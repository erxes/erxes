import { IconRobot, IconTool, IconMessageCircle } from '@tabler/icons-react';
import { NavigationMenuLinkItem } from 'erxes-ui';

export const MastraNavigation = () => {
  return (
    <>
      <NavigationMenuLinkItem
        name="Chat"
        icon={IconMessageCircle}
        path="mastra/chat"
      />
      <NavigationMenuLinkItem
        name="Agents"
        icon={IconRobot}
        path="mastra/agents"
      />
      <NavigationMenuLinkItem
        name="Tools"
        icon={IconTool}
        path="mastra/tools"
      />
    </>
  );
};
