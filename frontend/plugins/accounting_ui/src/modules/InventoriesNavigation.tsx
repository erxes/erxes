import {
  IconBucketOff,
  IconBuildingWarehouse,
  IconFlagStar,
  IconScale,
  IconAssembly,
} from '@tabler/icons-react';

import { NavigationSection } from './NavigationSection';

export const InventoriesNavigation = () => (
  <NavigationSection
    name="inventory-acc"
    icon={IconBuildingWarehouse}
    sectionPath="/accounting/inventories"
    items={[
      {
        name: 'production-executions',
        icon: IconAssembly,
        path: 'accounting/inventories/job-executions',
      },
      {
        name: 'remainder',
        icon: IconFlagStar,
        path: 'accounting/inventories/remainders',
      },
      {
        name: 'inventory-count-label',
        icon: IconScale,
        path: 'accounting/inventories/safe-remainders',
      },
      {
        name: 'reserved-inventory',
        icon: IconBucketOff,
        path: 'accounting/inventories/reserve-remainders',
      },
    ]}
  />
);
