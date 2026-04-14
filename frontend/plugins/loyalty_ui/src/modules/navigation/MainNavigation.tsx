import { IconUserFilled } from '@tabler/icons-react';
import { NavigationMenuLinkItem } from 'erxes-ui';

export const MainNavigation = () => {
  return (
    <div>
      <NavigationMenuLinkItem
        name="Loyalty"
        icon={IconUserFilled}
        pathPrefix="loyalty"
        path="vouchers"
      />
    </div>
  );
};
