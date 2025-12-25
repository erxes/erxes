import { IconSandbox } from '@tabler/icons-react';


import { IUIConfig } from 'erxes-ui/types';

export const CONFIG: IUIConfig = {
  name: 'loyalty',
  icon: IconSandbox,
  modules: [
    {
      name: 'pricing',
      icon: IconSandbox,
      path: 'pricing',
      hasSettings: true,
      hasRelationWidget: false,
      hasFloatingWidget: false,
    },
  ],
};
