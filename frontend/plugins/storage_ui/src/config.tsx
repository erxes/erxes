
import { IconPackage } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui';

export const CONFIG: IUIConfig = {
  name: 'storage',
  path: 'storage',
  icon: IconPackage,
  navigationGroup: {
    name: 'storage',
    defaultPath: 'storage/storage',
    icon: IconPackage,
  },

  modules: [
    {
      name: 'storage',
      icon: IconPackage,
      path: 'storage/storage',
    },
  ],
};
