import {
  IconBuildingEstate,
  IconMoneybag,
  IconUserCheck,
} from '@tabler/icons-react';
import { NavigationSection } from '../NavigationSection';

export const FixedAssetsNavigation = () => (
  <NavigationSection
    name="Үндсэн хөрөнгө"
    icon={IconBuildingEstate}
    sectionPath="/accounting/fixed-assets"
    items={[
      {
        name: 'Эд хариуцагч',
        icon: IconUserCheck,
        path: 'accounting/fixed-assets/owner-records',
      },
      {
        name: 'Үлдэгдэл',
        icon: IconMoneybag,
        path: 'accounting/fixed-assets/remainders',
      },
    ]}
  />
);
