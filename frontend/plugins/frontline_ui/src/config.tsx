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

const FrontlineSettingsNavigation = lazy(() =>
  import('./modules/FrontlineSettingsNavigation').then((module) => ({
    default: module.FrontlineSettingsNavigation,
  })),
);

export const CONFIG: IUIConfig = {
  name: 'frontline',
  path: 'frontline',
  hasFloatingWidget: true,
  settingsNavigation: () => (
    <Suspense fallback={<div />}>
      <FrontlineSettingsNavigation />
    </Suspense>
  ),
  navigationGroup: {
    name: 'frontline',
    icon: IconStackFront,
    content: () => (
      <Suspense fallback={<div />}>
        <FrontlineNavigation />
      </Suspense>
    ),
    subGroup: () => (
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
      name: 'frontline',
      icon: IconMail,
      path: 'frontline',
      hasSettings: false,
      hasAutomation: true,
    },
    {
      name: 'ticket',
      path: 'frontline/ticket',
      settingsOnly: true,
    },
  ],

  relationWidgets: [
    {
      name: 'conversation',
      icon: IconMail,
    },
    {
      name: 'ticket',
      icon: IconTicket,
    },
  ],
};
