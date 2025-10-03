import { NavigationMenuGroup, NavigationMenuLinkItem } from 'erxes-ui';
import { IconCode } from '@tabler/icons-react';

export const DevelopmentNavigation = () => {
  return (
    <NavigationMenuGroup name="Development">
      <NavigationMenuLinkItem
        name="components"
        icon={IconCode}
        path="components"
      />
    </NavigationMenuGroup>
  );
};
