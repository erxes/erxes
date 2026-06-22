import { IconCashRegister, IconSandbox, IconChartBar } from '@tabler/icons-react';
import { NavigationMenuLinkItem } from 'erxes-ui';

export const MainNavigation = () => {
  return (
    <>
      <NavigationMenuLinkItem
        name="Sales Pipeline"
        path="sales/deals"
        icon={IconSandbox}
      />
      <NavigationMenuLinkItem
        name="POS"
        icon={IconCashRegister}
        path="sales/pos"
      />
      <NavigationMenuLinkItem
        name="Reports"
        icon={IconChartBar}
        path="sales/reports"
      />
    </>
  );
};