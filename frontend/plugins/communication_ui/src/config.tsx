import { IconMessages } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui';

export const CONFIG: IUIConfig = {
  name: 'communication',
  path: 'communication',
  icon: IconMessages,
  navigationGroup: {
    name: 'communication',
    defaultPath: 'communication/messaging',
    icon: IconMessages,
  },
  modules: [
    {
      name: 'messaging',
      icon: IconMessages,
      path: 'communication/messaging',
    },
  ],
};
