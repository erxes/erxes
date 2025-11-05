import { IconSandbox } from '@tabler/icons-react';


import { IUIConfig } from 'erxes-ui/types';

export const CONFIG: IUIConfig = {
  name: 'cars',
  icon: IconSandbox,
  modules: [
    {
      name: 'module',
      icon: IconSandbox,
      path: 'module',
      hasSettings: true,
      hasWidgets: true,
    },
  ],
};
