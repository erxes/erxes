
  import { NavigationMenuLinkItem } from 'erxes-ui';
  import { IconSandbox } from '@tabler/icons-react';

export const AgentAssistantNavigation = () => {
  return (
    <>
     <NavigationMenuLinkItem
        name="agent-assistant"
        icon={IconSandbox}
        path="agent-assistant"
      />
    </>
  );
};
