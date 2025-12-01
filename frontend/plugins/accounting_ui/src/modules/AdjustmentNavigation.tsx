import {
  IconAdjustmentsCode, IconCrane, IconListCheck, IconListDetails
} from '@tabler/icons-react';
import { NavigationMenuGroup, NavigationMenuLinkItem } from 'erxes-ui';

export const AdjustmentNavigation = () => {
  return (
    <NavigationMenuGroup name="Тохиргоо бичилт">
      <NavigationMenuLinkItem name='МХ ханш тэгшитгэл' icon={IconAdjustmentsCode} path="accounting/adjustment/fundRate"></NavigationMenuLinkItem>
      <NavigationMenuLinkItem name='Тооцоо ханш тэгшитгэл' icon={IconAdjustmentsCode} path="accounting/adjustment/debRate"></NavigationMenuLinkItem>
      <NavigationMenuLinkItem name='Барааны өртөг тооцоо' icon={IconAdjustmentsCode} path="accounting/adjustment/inventory"></NavigationMenuLinkItem>
      <NavigationMenuLinkItem name='FixedAsset' icon={IconAdjustmentsCode} path="accounting/adjustment/fxa"></NavigationMenuLinkItem>
      <NavigationMenuLinkItem name='Хаалтын бичилт' icon={IconAdjustmentsCode} path="accounting/adjustment/closing"></NavigationMenuLinkItem>
    </NavigationMenuGroup>
  );
};
