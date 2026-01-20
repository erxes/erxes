import { IconSandbox } from '@tabler/icons-react';
import { NavigationMenuLinkItem } from 'erxes-ui';
import React from 'react';

export const MainNavigation = () => {
  return (
    <>
      <NavigationMenuLinkItem
        name="Put Response"
        path="mongolian/put-response"
        icon={IconSandbox}
      />
      <NavigationMenuLinkItem
        name="Erkhet Sync"
        path="mongolian/sync-erkhet"
        icon={IconSandbox}
      />
      <NavigationMenuLinkItem
        name="Product Places"
        path="mongolian/product-places"
        icon={IconSandbox}
      />
    </>
  );
};
