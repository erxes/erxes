import { IconBooks, IconLibraryPhoto, IconSandbox } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui/types';
import { CONTENT_PANEL_CONTENT_TYPES } from '@/cms/shared/side-panel/contentPanelTypes';

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
  widgets: {
    recordPanels: CONTENT_PANEL_CONTENT_TYPES.map((contentType) => ({
      contentType,
      properties: false,
      draftTitle: true,
    })),
  },
};
