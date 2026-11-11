import {
  IconChartArcs,
  IconChartAreaLine,
  IconChecklist,
  IconClipboard,
  IconListCheck,
  IconRestore,
  IconUserCheck,
  IconUsers,
  IconUsersGroup,
} from '@tabler/icons-react';
import { Suspense, lazy } from 'react';

import { IUIConfig, TPropertyInputProps } from 'erxes-ui';
import { getTaskDetailPath } from '@/task/utils/getTaskDetailPath';
import { SEARCH_PROVIDERS } from '~/searchProviders';
import { TASK_CONNECTION_CONTENT_TYPE } from '~/widgets/contact/taskContactConnection';
import { OPERATION_DASHBOARD_MODULES } from '~/widgets/dashboard/dashboardModules';

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
    {
      name: 'integrations',
      icon: IconListCheck,
      path: 'operation/settings/integrations',
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

    contactWidgets: [
      { name: 'tasks', label: 'Tasks & triages', icon: IconChecklist },
      { name: 'projects', label: 'Projects', icon: IconClipboard },
    ],

    // Labels and descriptions are `operation` translation keys.
    dashboardWidgets: [
      {
        name: OPERATION_DASHBOARD_MODULES.myTasks,
        preview: 'list',
        label: 'dashboard.my-tasks',
        description: 'dashboard.my-tasks-description',
        icon: IconUserCheck,
        defaultSize: { w: 4, h: 6 },
        minSize: { w: 3, h: 4 },
        singleton: true,
      },
      {
        name: OPERATION_DASHBOARD_MODULES.projectProgress,
        preview: 'area',
        label: 'dashboard.project-progress',
        description: 'dashboard.project-progress-description',
        icon: IconChartAreaLine,
        defaultSize: { w: 6, h: 7 },
        minSize: { w: 4, h: 6 },
        configurable: true,
      },
      {
        name: OPERATION_DASHBOARD_MODULES.projectProgressByMember,
        preview: 'progress',
        label: 'dashboard.project-progress-by-member',
        description: 'dashboard.project-progress-by-member-description',
        icon: IconUsers,
        defaultSize: { w: 4, h: 6 },
        minSize: { w: 3, h: 4 },
        configurable: true,
      },
      {
        name: OPERATION_DASHBOARD_MODULES.projectProgressByTeam,
        preview: 'progress',
        label: 'dashboard.project-progress-by-team',
        description: 'dashboard.project-progress-by-team-description',
        icon: IconUsersGroup,
        defaultSize: { w: 4, h: 6 },
        minSize: { w: 3, h: 4 },
        configurable: true,
      },
      {
        name: OPERATION_DASHBOARD_MODULES.cycleProgress,
        preview: 'area',
        label: 'dashboard.cycle-progress',
        description: 'dashboard.cycle-progress-description',
        icon: IconRestore,
        defaultSize: { w: 6, h: 7 },
        minSize: { w: 4, h: 6 },
        configurable: true,
      },
      {
        name: OPERATION_DASHBOARD_MODULES.cycleProgressByMember,
        preview: 'progress',
        label: 'dashboard.cycle-progress-by-member',
        description: 'dashboard.cycle-progress-by-member-description',
        icon: IconUsers,
        defaultSize: { w: 4, h: 6 },
        minSize: { w: 3, h: 4 },
        configurable: true,
      },
      {
        name: OPERATION_DASHBOARD_MODULES.cycleProgressByProject,
        preview: 'progress',
        label: 'dashboard.cycle-progress-by-project',
        description: 'dashboard.cycle-progress-by-project-description',
        icon: IconChartArcs,
        defaultSize: { w: 4, h: 6 },
        minSize: { w: 3, h: 4 },
        configurable: true,
      },
    ],

    recordPanels: [
      { contentType: 'operation:task', detailPath: getTaskDetailPath },
      { contentType: 'operation:triage', properties: false },
      {
        contentType: TASK_CONNECTION_CONTENT_TYPE,
        properties: false,
        draftTitle: true,
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
