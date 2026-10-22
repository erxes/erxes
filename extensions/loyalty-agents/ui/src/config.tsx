import { IconUsers } from '@tabler/icons-react';
import { injectStyles } from 'erxes-sdk/react';
import type { IUIConfig } from 'erxes-ui';
import css from '../generated/extension.css?raw';

// The host's CSS only has the Tailwind classes the host itself uses.
injectStyles('loyalty-agents', css);

export const CONFIG: IUIConfig = {
  name: 'loyaltyAgents',
  path: 'loyalty-agents',
  modules: [
    {
      name: 'Loyalty agents',
      path: 'loyalty-agents',
      icon: IconUsers,
    },
  ],
};
