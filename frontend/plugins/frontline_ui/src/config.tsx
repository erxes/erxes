import { IconMail, IconStackFront, IconTicket } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui';
import { lazy, Suspense } from 'react';

const FrontlineNavigation = lazy(() =>
  import('./modules/FrontlineNavigation').then((module) => ({
    default: module.FrontlineNavigation,
  })),
);

const FrontlineSubGroups = lazy(() =>
  import('./modules/FrontlineSubGroups').then((module) => ({
    default: module.FrontlineSubGroups,
  })),
);

export const CONFIG: IUIConfig = {
  name: 'frontline',
  navigationGroup: {
    name: 'frontline',
    icon: IconStackFront,
    content: () => (
      <Suspense fallback={<div />}>
        <FrontlineNavigation />
      </Suspense>
    ),
    subGroups: () => (
      <Suspense fallback={<div />}>
        <FrontlineSubGroups />
      </Suspense>
    ),
  },
  modules: [
    {
      name: 'channels',
      path: 'frontline/channels',
      settingsOnly: true,
      hasFloatingWidget: true,
    },
    {
      name: 'configs',
      path: 'frontline/config',
      settingsOnly: true,
    },
    {
      name: 'ticket',
      icon: IconTicket,
      path: 'frontline/ticket',
      hasSettings: true,
      hasRelationWidget: true,
      settingsOnly: true,
    },
    {
      name: 'frontline',
      icon: IconMail,
      path: 'frontline',
      hasSettings: false,
    },
  ],
};
