import { IconDirections } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui';
import { SEARCH_PROVIDERS } from '~/searchProviders';

export const CONFIG: IUIConfig = {
  name: 'tourism',
  path: 'tourism',
  navigationGroup: {
    name: 'tourism',
    defaultPath: 'tourism/pms',
    icon: IconDirections,
  },
  modules: [
    {
      name: 'PMS',
      icon: IconDirections,
      path: 'tourism/pms',
      hasRelationWidget: true,
    },
    {
      name: 'TMS',
      icon: IconDirections,
      path: 'tourism/tms',
    },
  ],
  searchProviders: SEARCH_PROVIDERS,
};
