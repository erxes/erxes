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
      name: 'inbox',
      icon: IconMail,
      path: 'inbox',
    },
    {
      name: 'ticket',
      icon: IconTicket,
      path: 'ticket',
    },
    {
      name: 'frontline',
      icon: IconMail,
      path: 'frontline',
    },
  ],
};
