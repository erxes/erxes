import { IconBuilding, IconRadar, IconUser } from '@tabler/icons-react';

export const CORE_RELATIONS = [
  {
    pluginName: 'core',
    name: 'customer',
    icon: IconUser,
    label: 'Customers',
  },
  {
    pluginName: 'core',
    name: 'company',
    icon: IconBuilding,
    label: 'Companies',
  },
  {
    pluginName: 'core',
    name: 'trackedData',
    icon: IconRadar,
    label: 'Tracked data',
    contentTypes: ['core:customer'],
  },
];
