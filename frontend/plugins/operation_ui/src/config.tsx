import {
  IconChecklist,
  IconClipboard,
  IconListCheck,
  IconRestore,
} from '@tabler/icons-react';
import { Suspense, lazy } from 'react';

import { IUIConfig, TFavoriteNameProps, TPropertyInputProps } from 'erxes-ui';
import { useGetCurrentUsersTeams } from '@/team/hooks/useGetCurrentUsersTeams';

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

const getOperationFavoriteName = (path: string) => {
  const pathWithoutQuery = path.split('?')[0].replace(/^\/|\/$/g, '');
  const isTeamPath = pathWithoutQuery.startsWith('operation/team/');

  if (pathWithoutQuery === 'operation/tasks') return 'My Tasks';
  if (pathWithoutQuery === 'operation/tasks/created') return 'Created Tasks';
  if (pathWithoutQuery === 'operation/projects') return 'My Projects';
  if (pathWithoutQuery === 'operation/team') return 'Operation / Teams';

  if (
    pathWithoutQuery.includes('/projects/') &&
    pathWithoutQuery.endsWith('/tasks')
  ) {
    return 'Project / Tasks';
  }

  if (pathWithoutQuery.includes('/projects/')) return 'Project Detail';
  if (pathWithoutQuery.includes('/tasks/')) return 'Task Detail';
  if (pathWithoutQuery.includes('/cycles/')) return 'Cycle Detail';
  if (pathWithoutQuery.includes('/triage/')) return 'Triage Detail';

  if (isTeamPath && pathWithoutQuery.endsWith('/triage'))
    return 'Team / Triage';
  if (isTeamPath && pathWithoutQuery.endsWith('/projects')) {
    return 'Team / Projects';
  }

  if (isTeamPath && pathWithoutQuery.endsWith('/tasks')) return 'Team / Tasks';
  if (isTeamPath && pathWithoutQuery.endsWith('/cycles'))
    return 'Team / Cycles';

  return 'Operation';
};

const getTeamIdFromOperationPath = (path: string) => {
  const parts = path
    .split('?')[0]
    .replace(/^\/|\/$/g, '')
    .split('/');
  const teamIndex = parts.findIndex((part) => part === 'team');

  return teamIndex > -1 ? parts[teamIndex + 1] : undefined;
};

const getOperationTeamFavoriteSection = (path: string) => {
  const parts = path
    .split('?')[0]
    .replace(/^\/|\/$/g, '')
    .split('/');
  const teamIndex = parts.findIndex((part) => part === 'team');
  const section = teamIndex > -1 ? parts[teamIndex + 2] : undefined;
  const detailId = teamIndex > -1 ? parts[teamIndex + 3] : undefined;
  const childSection = teamIndex > -1 ? parts[teamIndex + 4] : undefined;

  if (section === 'projects' && childSection === 'tasks') {
    return 'Project Tasks';
  }

  if (section === 'projects') return detailId ? 'Project Detail' : 'Projects';
  if (section === 'tasks') return detailId ? 'Task Detail' : 'Tasks';
  if (section === 'cycles') return detailId ? 'Cycle Detail' : 'Cycles';
  if (section === 'triage') return detailId ? 'Triage Detail' : 'Triage';

  return undefined;
};

const OperationTeamFavoriteName = ({
  path,
  fallbackName,
}: TFavoriteNameProps) => {
  const teamId = getTeamIdFromOperationPath(path);
  const section = getOperationTeamFavoriteSection(path);
  const { teams } = useGetCurrentUsersTeams({
    skip: !teamId,
  });
  const teamName = teams?.find((team) => team._id === teamId)?.name;

  if (!section) return fallbackName;
  if (!teamName) return `Team / ${section}`;

  return `Team / ${teamName} / ${section}`;
};

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
      favoriteName: getOperationFavoriteName,
      hasAutomation: true,
    },
    {
      name: 'team',
      path: 'operation/team',
      favoriteName: getOperationFavoriteName,
    },
    {
      name: 'projects',
      path: 'operation/projects',
      icon: IconClipboard,
      favoriteName: getOperationFavoriteName,
    },
    {
      name: 'tasks',
      icon: IconChecklist,
      path: 'operation/tasks',
      favoriteName: getOperationFavoriteName,
    },
    {
      name: 'task created',
      icon: IconChecklist,
      path: 'operation/tasks/created',
      favoriteName: getOperationFavoriteName,
    },
    {
      name: 'Triage',
      icon: IconChecklist,
      path: 'operation/team/:teamId/triage',
      favoriteName: getOperationFavoriteName,
      favoriteNameComponent: OperationTeamFavoriteName,
    },
    {
      name: 'project',
      path: 'operation/team/:teamId/projects',
      icon: IconClipboard,
      favoriteName: getOperationFavoriteName,
      favoriteNameComponent: OperationTeamFavoriteName,
    },
    {
      name: 'tasks',
      path: 'operation/team/:teamId/tasks',
      icon: IconChecklist,
      favoriteName: getOperationFavoriteName,
      favoriteNameComponent: OperationTeamFavoriteName,
    },
    {
      name: 'cycles',
      path: 'operation/team/:teamId/cycles',
      icon: IconRestore,
      favoriteName: getOperationFavoriteName,
      favoriteNameComponent: OperationTeamFavoriteName,
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
