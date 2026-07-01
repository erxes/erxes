import {
  IconChecklist,
  IconClipboard,
  IconListCheck,
} from '@tabler/icons-react';
import { Suspense, lazy } from 'react';

import { IUIConfig, TPropertyInputProps } from 'erxes-ui';

const TaskStatusPropertyInput = lazy(() =>
  import('./modules/task/components/task-selects/TaskStatusPropertyInput').then(
    (module) => ({
      default: module.TaskStatusPropertyInput,
    }),
  ),
);

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
      hasAutomation: true,
    },
    {
      name: 'team',
      path: 'operation/team',
    },
    {
      name: 'projects',
      path: 'operation/projects',
    },
  ],
  widgets: {
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
    propertyInputs: {
      taskStatus: (props: TPropertyInputProps) => (
        <Suspense fallback={<div />}>
          <TaskStatusPropertyInput {...props} />
        </Suspense>
      ),
    },
  },
};
