import { IconSandbox } from '@tabler/icons-react';


import { IUIConfig } from 'erxes-ui/types';

export const CONFIG: IUIConfig = {
  name: 'insurance',
  icon: IconSandbox,
  modules: [
    {
      name: 'insurance',
      icon: IconSandbox,
      path: 'insurance',
      hasSettings: true,
      hasRelationWidget: false,
      hasFloatingWidget: false,
    },
  ],
};
