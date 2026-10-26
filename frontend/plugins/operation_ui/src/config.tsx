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

export const CONFIG: IUIConfig = {
  name: 'operation',
  path: 'operation',
  icon: IconListCheck,
  navigationGroup: {
    name: 'operation',
    defaultPath: 'operation/projects',
    icon: IconListCheck,
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
      path: 'operation/settings/teams',
    },
    {
      name: 'github-integration',
      icon: IconListCheck,
      path: 'operation/settings/github',
    },
  ],
  widgets: {
    relationWidgets: [
      {
        name: 'projects',
        icon: IconClipboard,
      },
      {
        name: 'tasks',
        icon: IconChecklist,
      },
    ],
    // A customer's / company's tasks and projects on their overview
    // (`./contactWidget`).
    contactWidgets: [
      { name: 'tasks', label: 'Tasks & triages', icon: IconChecklist },
      { name: 'projects', label: 'Projects', icon: IconClipboard },
    ],
    // Tasks and triages open in the app's side panel (`./recordPanel`).
    recordPanels: [
      { contentType: 'operation:task' },
      { contentType: 'operation:triage', properties: false },
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
