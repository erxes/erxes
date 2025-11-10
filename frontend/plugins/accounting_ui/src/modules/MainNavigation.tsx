import {
  IconCrane, IconListCheck, IconListDetails
} from '@tabler/icons-react';
import { NavigationMenuLinkItem } from 'erxes-ui';

export const MainNavigation = () => {
  return (
    <>
      <NavigationMenuLinkItem name='Transactions' icon={IconListDetails} path="accounting/main" />
      <NavigationMenuLinkItem name='Entry lines' icon={IconListCheck} path="accounting/records" />
      <NavigationMenuLinkItem name='Odd entries' icon={IconCrane} path="accounting/odd-transactions" />
    </>
  );
};
