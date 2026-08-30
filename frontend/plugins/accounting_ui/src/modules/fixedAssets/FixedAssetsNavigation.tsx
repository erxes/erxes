import { IconMoneybag, IconUserCheck } from '@tabler/icons-react';
import { NavigationMenuGroup, NavigationMenuLinkItem } from 'erxes-ui';

export const FixedAssetsNavigation = () => {
  return (
    <NavigationMenuGroup name="Үндсэн хөрөнгө">
      <NavigationMenuLinkItem
        name="Эд хариуцагч"
        icon={IconUserCheck}
        path="accounting/fixed-assets/owner-records"
      />
      <NavigationMenuLinkItem
        name="Үлдэгдэл"
        icon={IconMoneybag}
        path="accounting/fixed-assets/remainders"
      />
    </NavigationMenuGroup>
  );
};
