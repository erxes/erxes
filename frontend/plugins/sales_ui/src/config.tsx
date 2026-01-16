import { IconBriefcase, IconSandbox } from '@tabler/icons-react';
import { Suspense, lazy } from 'react';

import { IUIConfig } from 'erxes-ui';

const MainNavigation = lazy(() =>
  import('./modules/MainNavigation').then((module) => ({
    default: module.MainNavigation,
  })),
);

const SalesSubNavigation = lazy(() =>
  import('./modules/SalesSubNavigation').then((module) => ({
    default: module.SalesSubNavigation,
  })),
);

const PosOrderNavigation = lazy(() =>
  import('./modules/pos/PosOrderNavigation').then((module) => ({
    default: module.PosOrderNavigation,
  })),
);

const SalesSettingsNavigation = lazy(() =>
  import('./modules/SalesSettingsNavigation').then((module) => ({
    default: module.SalesSettingsNavigation,
  })),
);

export const CONFIG: IUIConfig = {
  name: 'sales',
  path: 'sales',
  settingsNavigation: () => (
    <Suspense fallback={<div />}>
      <SalesSettingsNavigation />
    </Suspense>
  ),
  navigationGroup: {
    name: 'sales',
    icon: IconBriefcase,
    content: () => (
      <Suspense fallback={<div />}>
        <MainNavigation />
      </Suspense>
    ),
    subGroup: () => (
      <Suspense fallback={<div />}>
        <SalesSubNavigation />
        <PosOrderNavigation />
      </Suspense>
    ),
  },
  modules: [
    {
      name: 'sales',
      icon: IconBriefcase,
      path: 'sales',
    },
    {
      name: 'deals',
      path: 'sales/deals',
    },
    {
      name: 'pos',
      icon: IconBriefcase,
      path: 'sales/pos',
    },
  ],
  widgets: {
    relationWidgets: [
      {
        name: 'deals',
        icon: IconSandbox,
      },
    ],
  },
};
