import {
  IconBuildingEstate,
  IconMoneybag,
  IconUserCheck,
} from '@tabler/icons-react';

import { NavigationSection } from '../NavigationSection';

export const FixedAssetsNavigation = () => (
  <NavigationSection
    name="fixed-asset"
    icon={IconBuildingEstate}
    sectionPath="/accounting/fixed-assets"
    items={[
      {
        name: 'asset-custodian',
        icon: IconUserCheck,
        path: 'accounting/fixed-assets/owner-records',
      },
      {
        name: 'remainder',
        icon: IconMoneybag,
        path: 'accounting/fixed-assets/remainders',
      },
    ]}
  />
);
