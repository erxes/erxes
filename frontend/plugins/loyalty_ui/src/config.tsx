import { IconAward } from '@tabler/icons-react';

import { IUIConfig } from 'erxes-ui/types';

export const CONFIG: IUIConfig = {
  name: 'loyalty',
  icon: IconAward,
  navigationGroup: {
    name: 'Loyalty',
    icon: IconAward,
    content: () => (
      <></>
    )
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
  ],
};
