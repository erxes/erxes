import { IconAward } from '@tabler/icons-react';

import { IUIConfig } from 'erxes-ui/types';

export const CONFIG: IUIConfig = {
  name: 'loyalty',
  icon: IconAward,
  navigationGroup: {
    name: 'Loyalty',
    icon: IconAward,
    content: () => null,
  },
  modules: [
    {
      name: 'pricing',
      icon: IconAward,
      path: 'pricing',
      hasSettings: true,
      hasRelationWidget: false,
      hasFloatingWidget: false,
    },
    {
      name: 'loyalty',
      icon: IconAward,
      path: 'loyalty',
      hasSettings: true,
      hasRelationWidget: false,
      hasFloatingWidget: false,
    },
  ],
};
