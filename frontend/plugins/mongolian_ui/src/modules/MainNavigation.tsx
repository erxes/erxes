import { IconSandbox, IconMapPin } from '@tabler/icons-react';

import { NavigationMenuLinkItem } from 'erxes-ui';

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
        path="mongolian/sync-erkhet-history"
        icon={IconSandbox}
      />
        <NavigationMenuLinkItem
        name="Product Places"
        path="mongolian/product-places"
        icon={IconMapPin}
      />
    </>
  );
};
