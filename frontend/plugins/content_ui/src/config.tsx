import { IconBooks, IconLibraryPhoto, IconSandbox } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui/types';

export const CONFIG: IUIConfig = {
  name: 'content',
  path: 'content',
  navigationGroup: {
    name: 'content',
    defaultPath: 'content/cms',
    icon: IconLibraryPhoto,
  },
  modules: [
    {
      name: 'cms',
      icon: IconBooks,
      path: 'content/cms',
    },
    {
      name: 'web-builder',
      icon: IconSandbox,
      path: 'content/web-builder',
    },
  ],
};
