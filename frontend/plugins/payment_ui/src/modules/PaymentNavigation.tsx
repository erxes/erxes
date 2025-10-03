import { IconCurrencyDollar } from '@tabler/icons-react';
import { NavigationMenuLinkItem } from 'erxes-ui';

export const PaymentNavigation = () => {
  return (
    <NavigationMenuLinkItem name="Payment" icon={IconCurrencyDollar} path="payment" />
  );
};
