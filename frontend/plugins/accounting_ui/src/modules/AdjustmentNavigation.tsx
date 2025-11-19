import {
  IconAdjustmentsCode, IconCrane, IconListCheck, IconListDetails
} from '@tabler/icons-react';
import { NavigationMenuGroup, NavigationMenuLinkItem } from 'erxes-ui';

export const AdjustmentNavigation = () => {
  return (
    <NavigationMenuGroup name="Adjustments">
      <NavigationMenuLinkItem name='Fund Rate' icon={IconAdjustmentsCode} path="accounting/adjustment/fundRate"></NavigationMenuLinkItem>
      <NavigationMenuLinkItem name='Debt Rate' icon={IconAdjustmentsCode} path="accounting/adjustment/debRate"></NavigationMenuLinkItem>
      <NavigationMenuLinkItem name='Inventory Cost' icon={IconAdjustmentsCode} path="accounting/adjustment/inventory"></NavigationMenuLinkItem>
      <NavigationMenuLinkItem name='FixedAsset' icon={IconAdjustmentsCode} path="accounting/adjustment/fxa"></NavigationMenuLinkItem>
    </NavigationMenuGroup>
  );
};
