import React from 'react';
import { IconSandbox, IconMapPin } from '@tabler/icons-react';
import { CustomNavItem } from './productplaces/components/CustomNavItem';

export const MainNavigation = () => {
  return (
    <>
      <CustomNavItem
        name="Put Response"
        path="mongolian/put-response"
        icon={IconSandbox}
      />
      <CustomNavItem
        name="Erkhet Sync"
        path="mongolian/sync-erkhet-history"
        icon={IconSandbox}
      />
      <CustomNavItem
        name="Product Places"
        path="mongolian/product-places"
        icon={IconMapPin}
      />
    </>
  );
};