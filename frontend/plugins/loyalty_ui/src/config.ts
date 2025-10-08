import { IconSandbox } from '@tabler/icons-react';


import { IUIConfig } from 'erxes-ui/types';

export const CONFIG: IUIConfig = {
  name: 'loyalty',
  icon: IconSandbox,
  modules: [
    {
      name: 'loyalty',
      icon: IconSandbox,
      path: 'loyalty',
      hasSettings: true,
      hasRelationWidget: false,
      hasFloatingWidget: false,
    },
  ],
};
