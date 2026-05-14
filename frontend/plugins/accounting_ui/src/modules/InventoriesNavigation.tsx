import { IconBucketOff, IconFlagStar, IconScale } from '@tabler/icons-react';
import { NavigationMenuGroup, NavigationMenuLinkItem } from 'erxes-ui';

export const InventoriesNavigation = () => {
  return (
    <NavigationMenuGroup name="Барааны т.х">
      <NavigationMenuLinkItem
        name="Үлдэгдэл"
        icon={IconFlagStar}
        path="accounting/inventories/remainders"
      ></NavigationMenuLinkItem>
      <NavigationMenuLinkItem
        name="Тооллого"
        icon={IconScale}
        path="accounting/inventories/safe-remainders"
      ></NavigationMenuLinkItem>
      <NavigationMenuLinkItem
        name="Нөөц үлдэгдэл"
        icon={IconBucketOff}
        path="accounting/inventories/reserve-remainders"
      ></NavigationMenuLinkItem>
    </NavigationMenuGroup>
  );
};
