import { IconChecklist, IconClipboard, IconUsers } from '@tabler/icons-react';
import {
  defineSearchProvider,
  ISearchProvider,
  readArray,
  readCursorList,
} from 'erxes-ui';

const UNNAMED = 'Unnamed';

type TTaskNode = {
  _id: string;
  createdAt?: string | null;
  name?: string | null;
};

const tasksSearchProvider = defineSearchProvider<TTaskNode>({
  key: 'operation-tasks',
  label: 'Tasks',
  icon: IconChecklist,
  order: 150,
  selections: [
    {
      alias: 'gs_operation_tasks',
      field: 'getTasks',
      args: 'filter: { name: $searchValue, limit: $limit, orderBy: $orderBy }',
      body: '{ list { _id name createdAt } totalCount }',
    },
  ],
  select: (payload) => readCursorList<TTaskNode>(payload, 'gs_operation_tasks'),
  toItem: (task) => ({
    id: task._id,
    title: task.name || UNNAMED,
    createdAt: task.createdAt ?? undefined,
    path: `/operation/tasks/${task._id}`,
  }),
});

type TProjectNode = {
  _id: string;
  createdAt?: string | null;
  name?: string | null;
};

const projectsSearchProvider = defineSearchProvider<TProjectNode>({
  key: 'operation-projects',
  label: 'Projects',
  icon: IconClipboard,
  order: 160,
  selections: [
    {
      alias: 'gs_operation_projects',
      field: 'getProjects',
      args: 'filter: { name: $searchValue, limit: $limit, orderBy: $orderBy }',
      body: '{ list { _id name createdAt } totalCount }',
    },
  ],
  select: (payload) =>
    readCursorList<TProjectNode>(payload, 'gs_operation_projects'),
  toItem: (project) => ({
    id: project._id,
    title: project.name || UNNAMED,
    createdAt: project.createdAt ?? undefined,
    path: `/operation/projects/${project._id}/overview`,
  }),
});

type TTeamNode = {
  _id: string;
  createdAt?: string | null;
  name?: string | null;
};

const teamsSearchProvider = defineSearchProvider<TTeamNode>({
  key: 'operation-teams',
  label: 'Teams',
  icon: IconUsers,
  order: 170,
  selections: [
    {
      alias: 'gs_operation_teams',
      field: 'getTeams',
      args: 'name: $searchValue, orderBy: $orderBy',
      body: '{ _id name createdAt }',
    },
  ],
  select: (payload) => {
    const nodes = readArray<TTeamNode>(payload, 'gs_operation_teams');
    return {
      nodes,
      totalCount: nodes.length,
      pageInfo: { hasNextPage: false, endCursor: null },
    };
  },
  toItem: (team) => ({
    id: team._id,
    title: team.name || UNNAMED,
    createdAt: team.createdAt ?? undefined,
    path: `/operation/team/${team._id}/tasks`,
  }),
});

export const SEARCH_PROVIDERS: ISearchProvider[] = [
  tasksSearchProvider,
  projectsSearchProvider,
  teamsSearchProvider,
];
