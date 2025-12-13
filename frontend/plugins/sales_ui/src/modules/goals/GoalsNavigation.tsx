import { NavigationMenuGroup, NavigationMenuLinkItem } from 'erxes-ui';
import { IconSandbox } from '@tabler/icons-react';

export const GoalsNavigation = () => {
  return (
    <NavigationMenuGroup name="Goals">
      <NavigationMenuLinkItem
        name="Goals"
        icon={IconSandbox}
        path="goals"
      />
    </NavigationMenuGroup>
  );
};
