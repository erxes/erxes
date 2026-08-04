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
import { useTranslation } from 'react-i18next';

/* Mongolian plugin nav-siin MSDynamic holboos haruulna */
export const MainNavigation = () => {
  const { t } = useTranslation('mongolian');
  return (
    <>
      <NavigationMenuLinkItem
        name={t('customers')}
        path="mongolian/msdynamic/customers"
        icon={IconUsers}
      />

      <NavigationMenuLinkItem
        name={t('products')}
        path="mongolian/msdynamic/products"
        icon={IconPackage}
      />

      <NavigationMenuLinkItem
        name={t('categories')}
        path="mongolian/msdynamic/categories"
        icon={IconCategory}
      />

      <NavigationMenuLinkItem
        name={t('prices')}
        path="mongolian/msdynamic/price"
        icon={IconCurrencyDollar}
      />

      <NavigationMenuLinkItem
        name={t('synced-orders')}
        path="mongolian/msdynamic/synced-orders"
        icon={IconChecklist}
      />

      <NavigationMenuLinkItem
        name={t('sync-history')}
        path="mongolian/msdynamic/sync-history"
        icon={IconHistory}
      />
    </>
  );
};
