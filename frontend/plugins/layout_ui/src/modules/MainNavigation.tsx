import { IconFileText } from '@tabler/icons-react';

import { NavigationMenuLinkItem } from 'erxes-ui';

export const MainNavigation = () => {
  return (
    <>
      <NavigationMenuLinkItem name="Pages" path="layout" icon={IconFileText} />
    </>
  );
};
