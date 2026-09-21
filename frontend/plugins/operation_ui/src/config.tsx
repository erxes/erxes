import {
  IconChecklist,
  IconClipboard,
  IconListCheck,
} from '@tabler/icons-react';
import { Suspense, lazy } from 'react';

import { IUIConfig, TPropertyInputProps } from 'erxes-ui';
import { SEARCH_PROVIDERS } from '~/searchProviders';

const TaskStatusPropertyInput = lazy(() =>
  import('@/task/components/task-selects/TaskStatusPropertyInput').then(
    (module) => ({
      default: module.TaskStatusPropertyInput,
    }),
  ),
);

const MainNavigation = lazy(() =>
  import('@/navigation/MainNavigation').then((module) => ({
    default: module.MainNavigation,
  })),
);

const TeamsNavigation = lazy(() =>
  import('@/navigation/TeamsNavigation').then((mod) => ({
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
    defaultPath: 'operation/projects',
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
      name: 'projects',
      icon: IconClipboard,
      path: 'operation/projects',
      hasAutomation: true,
      hasRelationWidget: true,
    },
    {
      name: 'tasks',
      icon: IconChecklist,
      path: 'operation/tasks',
      hasRelationWidget: true,
    },
    {
      name: 'team',
      icon: IconListCheck,
      path: 'operation/team',
    },
    {
      name: 'teams',
      icon: IconListCheck,
      path: 'settings/operation/teams',
    },
    {
      name: 'github-integration',
      icon: IconListCheck,
      path: 'settings/operation/github',
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
  searchProviders: SEARCH_PROVIDERS,
};
