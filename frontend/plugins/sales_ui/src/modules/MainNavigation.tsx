import { IconCashRegister, IconSandbox } from '@tabler/icons-react';

import { NavigationMenuLinkItem } from 'erxes-ui';

export const MainNavigation = () => {
  return (
    <>
      <NavigationMenuLinkItem
        name="Sales Pipeline"
        pathPrefix="/sales"
        path="deals"
        icon={IconSandbox}
      />
      <NavigationMenuLinkItem
        name="POS"
        icon={IconCashRegister}
        pathPrefix="/sales"
        path="pos"
      />
    </>
  );
};
