import { IconCalendarClock } from '@tabler/icons-react';
import { injectStyles } from 'erxes-sdk/react';
import type { IUIConfig } from 'erxes-ui';
import css from '../generated/extension.css?raw';

// The host's CSS only has the Tailwind classes the host itself uses.
injectStyles('deal-followups', css);

export const CONFIG: IUIConfig = {
  name: 'dealFollowups',
  path: 'deal-followups',
  modules: [
    {
      name: 'Follow-ups',
      path: 'deal-followups',
      icon: IconCalendarClock,
    },
  ],
};
