import { NavigationMenuLinkItem } from 'erxes-ui';
import { IconSandbox, IconBox } from '@tabler/icons-react';

export const TourismNavigation = () => {
  return (
    <>
      <NavigationMenuLinkItem
        name="pms"
        icon={IconSandbox}
        pathPrefix="tourism"
        path="pms"
      />

      <NavigationMenuLinkItem
        name="tms"
        icon={IconBox}
        pathPrefix="tourism"
        path="tms"
      />
    </>
  );
};
