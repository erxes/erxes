import { IconSandbox } from '@tabler/icons-react';


import { IUIConfig } from 'erxes-ui/types';

export const CONFIG: IUIConfig = {
  name: 'mongolian',
  icon: IconSandbox,
  modules: [
    {
      name: 'ebarimt',
      icon: IconSandbox,
      path: 'ebarimt',
      hasSettings: true,
      hasRelationWidget: false,
      hasFloatingWidget: false,
    },
  ],
};
