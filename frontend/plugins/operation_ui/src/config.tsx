import {
  IconChecklist,
  IconClipboard,
  IconListCheck,
  IconRestore,
} from '@tabler/icons-react';
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

const OperationSettingsNavigation = lazy(() =>
  import('@/OperationSettingsNavigation').then((mod) => ({
    default: mod.OperationSettingsNavigation,
  })),
);

export const CONFIG: IUIConfig = {
  name: 'operation',
  path: 'operation',
  icon: IconListCheck,
  settingsNavigation: () => (
    <Suspense fallback={<div />}>
      <OperationSettingsNavigation />
    </Suspense>
  ),
  navigationGroup: {
    name: 'operation',
    icon: IconListCheck,
    content: () => (
      <Suspense fallback={<div />}>
        <MainNavigation />
      </Suspense>
    ),
    subGroup: () => (
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
    },
    {
      name: 'team',
      path: 'operation/team',
    },
    {
      name: 'projects',
      path: 'operation/projects',
      icon: IconClipboard,
    },
    {
      name: 'tasks',
      icon: IconChecklist,
      path: 'operation/tasks',
    },
    {
      name: 'task created',
      icon: IconChecklist,
      path: 'operation/tasks/created',
    },
    {
      name: 'Triage',
      icon: IconChecklist,
      path: 'operation/team/:teamId/triage',
    },
    {
      name: 'project',
      path: 'operation/team/:teamId/projects',
      icon: IconClipboard,
    },
    {
      name: 'tasks',
      path: 'operation/team/:teamId/tasks',
      icon: IconChecklist,
    },
    {
      name: 'cycles',
      path: 'operation/team/:teamId/cycles',
      icon: IconRestore,
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
