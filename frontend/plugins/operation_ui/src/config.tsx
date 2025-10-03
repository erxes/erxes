import {
  IconListCheck,
  IconChecklist,
  IconClipboard,
} from '@tabler/icons-react';

import { IUIConfig } from 'erxes-ui';
import { lazy, Suspense } from 'react';

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
  ],

  relationWidgets: [
    {
      name: 'tasks',
      icon: IconChecklist,
    },
    {
      name: 'projects',
      icon: IconClipboard,
    },
  ],
};
