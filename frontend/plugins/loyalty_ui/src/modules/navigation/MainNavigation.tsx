import { IconClipboard, IconUserFilled } from '@tabler/icons-react';
import { NavigationMenuLinkItem } from 'erxes-ui';

export const MainNavigation = () => {
  return (
    <>
      <NavigationMenuLinkItem
        name="Pricing"
        icon={IconClipboard}
        pathPrefix="loyalty"
        path="pricing"
      />

      <NavigationMenuLinkItem
        name="Loyalty"
        icon={IconUserFilled}
        pathPrefix="loyalty"
        path="loyalty"
      />
    </>
  );
};
