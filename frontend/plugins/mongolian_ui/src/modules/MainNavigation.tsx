import { IconSandbox } from '@tabler/icons-react';
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
        path="mongolian/sync-erkhet"
        icon={IconSandbox}
      />
       <NavigationMenuLinkItem
        name="MSDynamic"
        path="mongolian/msdynamic/customers"
        icon={IconSandbox}
      />
    </>
  );
};
