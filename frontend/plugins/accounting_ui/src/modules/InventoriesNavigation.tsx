import {
  IconBucketOff,
  IconBuildingWarehouse,
  IconFlagStar,
  IconScale,
} from '@tabler/icons-react';
import { NavigationSection } from './NavigationSection';

export const InventoriesNavigation = () => (
  <NavigationSection
    name="Барааны т.х"
    icon={IconBuildingWarehouse}
    sectionPath="/accounting/inventories"
    items={[
      {
        name: 'Үлдэгдэл',
        icon: IconFlagStar,
        path: 'accounting/inventories/remainders',
      },
      {
        name: 'Тооллого',
        icon: IconScale,
        path: 'accounting/inventories/safe-remainders',
      },
      {
        name: 'Нөөц үлдэгдэл',
        icon: IconBucketOff,
        path: 'accounting/inventories/reserve-remainders',
      },
    ]}
  />
);
