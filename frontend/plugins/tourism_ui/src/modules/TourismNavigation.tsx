import { NavigationMenuLinkItem } from 'erxes-ui';
import { IconSandbox, IconBox } from '@tabler/icons-react';

export const TourismNavigation = () => {
  return (
    <>
      <NavigationMenuLinkItem
        name="PMS"
        icon={IconSandbox}
        pathPrefix="tourism"
        path="pms"
      />

      <NavigationMenuLinkItem
        name="TMS"
        icon={IconBox}
        pathPrefix="tourism"
        path="tms"
      />
    </>
  );
};
