import { IconSandbox } from '@tabler/icons-react';


import { IUIConfig } from 'erxes-ui/types';

export const CONFIG: IUIConfig = {
  name: 'template',
  icon: IconSandbox,
  modules: [
    {
      name: 'template',
      icon: IconSandbox,
      path: 'template',
      hasSettings: true,
      hasRelationWidget: false,
      hasFloatingWidget: false,
    },
  ],
};
