import { IconChecklist, IconListCheck } from '@tabler/icons-react';
import { Suspense, lazy } from 'react';

import { IUIConfig } from 'erxes-ui';

const MainNavigation = lazy(() =>
  import('./modules/navigation/MainNavigation').then((module) => ({
    default: module.MainNavigation,
  })),
);

const TeamsNavigation = lazy(() =>
  import('./modules/navigation/TeamsNavigation').then((mod) => ({
    default: mod.TeamsNavigation,
  })),
);

export const CONFIG: IUIConfig = {
  name: 'operation',
  icon: IconListCheck,
  navigationGroup: {
    name: 'operation',
    icon: IconListCheck,
    content: () => (
      <Suspense fallback={<div />}>
        <MainNavigation />
      </Suspense>
    ),
    subGroups: () => (
      <Suspense fallback={<div />}>
        <TeamsNavigation />
      </Suspense>
    ),
  },
  modules: [
    {
      name: 'operation',
      icon: IconListCheck,
      path: 'operation',
      hasSettings: false,
      hasRelationWidget: true,
      hasFloatingWidget: false,
    },
    {
      name: 'team',
      path: 'operation/team',
      settingsOnly: true,
    },
    {
      name: 'projects',
      path: 'operation/projects',
      settingsOnly: true,
    },
  ],
  widgets: {
    relationWidgets: [
      {
        name: 'tasks',
        icon: IconChecklist,
      },
    ],
  },
};
