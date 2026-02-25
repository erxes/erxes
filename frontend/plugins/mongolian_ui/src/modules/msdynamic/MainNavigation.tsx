import React from 'react';
import { NavigationMenuLinkItem } from 'erxes-ui';
import {
  IconUsers,
  IconPackage,
  IconCategory,
  IconCurrencyDollar,
  IconHistory,
  IconChecklist,
} from '@tabler/icons-react';

export const MainNavigation = () => {
  return (
    <>
      <NavigationMenuLinkItem
        name="Customers"
        path="mongolian/msdynamic/customers"
        icon={IconUsers}
      />

      <NavigationMenuLinkItem
        name="Products"
        path="mongolian/msdynamic/products"
        icon={IconPackage}
      />

      <NavigationMenuLinkItem
        name="Categories"
        path="mongolian/msdynamic/category"
        icon={IconCategory}
      />

      <NavigationMenuLinkItem
        name="Prices"
        path="mongolian/msdynamic/price"
        icon={IconCurrencyDollar}
      />

      <NavigationMenuLinkItem
        name="Synced Orders"
        path="mongolian/msdynamic/synced-orders"
        icon={IconChecklist}
      />

      <NavigationMenuLinkItem
        name="Sync History"
        path="mongolian/msdynamic/sync-history"
        icon={IconHistory}
      />
    </>
  );
};