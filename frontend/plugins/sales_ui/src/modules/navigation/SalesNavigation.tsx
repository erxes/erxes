import { NavigationMenuLinkItem } from 'erxes-ui';

export const SalesNavigation = () => {
  return (
    <>
      <NavigationMenuLinkItem name="Deals" path="sales/deals" />
      <NavigationMenuLinkItem name="POS" path="sales/pos" />
    </>
  );
};
