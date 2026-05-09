import {
  IconLayoutDashboard,
  IconLayoutGrid,
  IconStack2,
} from '@tabler/icons-react';
import { NavigationMenuLinkItem } from 'erxes-ui';

export const LayoutNavigation = () => {
  return (
    <>
      <NavigationMenuLinkItem
        name="Overview"
        icon={IconStack2}
        path="layout"
      />
      <NavigationMenuLinkItem
        name="Pages"
        icon={IconLayoutGrid}
        path="layout/pages/sample"
      />
      <NavigationMenuLinkItem
        name="Dashboards"
        icon={IconLayoutDashboard}
        path="layout/dashboards/demo"
      />
    </>
  );
};
