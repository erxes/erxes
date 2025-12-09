import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { GET_TASKS } from '@/task/graphql/queries/getTasks';
import { useProjects } from '@/project/hooks/useGetProjects';
import { ITask } from '@/task/types';
import { IProject } from '@/project/types';
import { useTags } from 'ui-modules';
import { PROJECT_PRIORITIES_OPTIONS } from '@/operation/constants/priorityLabels';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { useNonNullMultiQueryState } from 'erxes-ui';

export interface IStatItem {
  id: string;
  name: string;
  totalTasks: number;
  completedTasks: number;
  startedTasks: number;
}

interface UseTasksStatsProps {
  teamId?: string;
  userId?: string;
}

interface UseTasksStatsReturn {
  tasks: ITask[];
  loading: boolean;
  totalTasks: number;
  startedTasks: number;
  completedTasks: number;
  priorityStats: IStatItem[];
  projectStats: IStatItem[];
  tagStats: IStatItem[];
}

export const useTasksStats = ({
  teamId,
  userId,
}: UseTasksStatsProps): UseTasksStatsReturn => {
  const currentUser = useAtomValue(currentUserState);
  const {
    searchValue,
    assignee,
    team,
    priority,
    status,
    milestone,
    tags,
    cycleFilter,
    createdBy,
    estimatePoint,
    targetDate,
    createdDate,
    updatedDate,
    startDate,
    completedDate,
    project,
    projectStatus,
    projectPriority,
    projectLeadId,
    projectMilestoneName,
  } = useNonNullMultiQueryState<{
    searchValue: string;
    assignee: string;
    createdBy: string;
    team: string;
    priority: string;
    status: string;
    milestone: string;
    tags: string[];
    cycleFilter: string;
    estimatePoint: number;
    targetDate: string;
    createdDate: string;
    updatedDate: string;
    startDate: string;
    completedDate: string;
    project: string;
    projectStatus: string;
    projectPriority: string;
    projectLeadId: string;
    projectMilestoneName: string;
  }>([
    'searchValue',
    'assignee',
    'team',
    'priority',
    'status',
    'milestone',
    'tags',
    'cycleFilter',
    'createdBy',
    'estimatePoint',
    'targetDate',
    'createdDate',
    'updatedDate',
    'startDate',
    'completedDate',
    'project',
    'projectStatus',
    'projectPriority',
    'projectLeadId',
    'projectMilestoneName',
  ]);

  const effectiveUserId = userId || (!teamId ? currentUser?._id : undefined);
  const effectiveTeamId = teamId || team;

  const { data: tasksData, loading: tasksLoading } = useQuery(GET_TASKS, {
    variables: {
      filter: {
        teamId: effectiveTeamId || undefined,
        userId: effectiveUserId || undefined,
        cycleFilter: cycleFilter || undefined,
        name: searchValue || undefined,
        assigneeId: assignee || undefined,
        createdBy: createdBy || undefined,
        priority: priority || undefined,
        status: effectiveTeamId ? status : undefined,
        statusType: effectiveTeamId ? undefined : status,
        milestoneId: milestone || undefined,
        tagIds: tags || undefined,
        estimatePoint: estimatePoint || undefined,
        targetDate: targetDate || undefined,
        createdDate: createdDate || undefined,
        updatedDate: updatedDate || undefined,
        startDate: startDate || undefined,
        completedDate: completedDate || undefined,
        projectId: project || undefined,
        projectStatus: projectStatus ? Number(projectStatus) : undefined,
        projectPriority: projectPriority ? Number(projectPriority) : undefined,
        projectLeadId: projectLeadId || undefined,
        projectMilestoneName: projectMilestoneName || undefined,
        limit: 100,
      },
    },
    fetchPolicy: 'cache-and-network',
  });

  const tasks: ITask[] = useMemo(
    () => tasksData?.getTasks?.list || [],
    [tasksData],
  );

  const projectIds = useMemo(() => {
    const ids = new Set<string>();
    tasks.forEach((task) => {
      if (task.projectId) {
        ids.add(task.projectId);
      }
    });
    return Array.from(ids);
  }, [tasks]);
  console.log('projectIds', projectIds);
  const { projects: projectsList } = useProjects({
    variables: {
      _ids: projectIds,
    },
    skip: projectIds.length === 0,
  });
  console.log('projectsList', projectsList);
  const projects: IProject[] = useMemo(() => {
    return projectsList || [];
  }, [projectsList]);

  const tagIds = useMemo(() => {
    const ids = new Set<string>();
    tasks.forEach((task) => {
      if (task.tagIds) {
        task.tagIds.forEach((tagId) => ids.add(tagId));
      }
    });
    return Array.from(ids);
  }, [tasks]);

  const { tags: tagsData } = useTags({
    variables: {
      ids: tagIds,
      type: 'operation:task',
      includeWorkspaceTags: true,
    },
    skip: tagIds.length === 0,
  });

  const stats = useMemo(() => {
    let totalTasks = 0;
    let startedTasks = 0;
    let completedTasks = 0;

    const priorityMap = new Map<
      number,
      { total: number; completed: number; started: number }
    >();
    const projectMap = new Map<
      string,
      { total: number; completed: number; started: number }
    >();
    const tagMap = new Map<
      string,
      { total: number; completed: number; started: number }
    >();

    tasks.forEach((task) => {
      totalTasks++;

      const isCompleted = task.status === 'done';
      const isStarted = task.status !== 'backlog' && !isCompleted;

      if (isCompleted) {
        completedTasks++;
      } else if (isStarted) {
        startedTasks++;
      }

      const priority = task.priority ?? 0;
      const priorityStats = priorityMap.get(priority) || {
        total: 0,
        completed: 0,
        started: 0,
      };
      priorityStats.total++;
      if (isCompleted) priorityStats.completed++;
      if (isStarted) priorityStats.started++;
      priorityMap.set(priority, priorityStats);

      const projectId = task.projectId || 'no-project';
      const projectStatItem = projectMap.get(projectId) || {
        total: 0,
        completed: 0,
        started: 0,
      };
      projectStatItem.total++;
      if (isCompleted) projectStatItem.completed++;
      if (isStarted) projectStatItem.started++;
      projectMap.set(projectId, projectStatItem);

      if (task.tagIds && task.tagIds.length > 0) {
        task.tagIds.forEach((tagId) => {
          const tagStatItem = tagMap.get(tagId) || {
            total: 0,
            completed: 0,
            started: 0,
          };
          tagStatItem.total++;
          if (isCompleted) tagStatItem.completed++;
          if (isStarted) tagStatItem.started++;
          tagMap.set(tagId, tagStatItem);
        });
      }
    });

    const priorityStats: IStatItem[] = Array.from(priorityMap.entries())
      .map(([priority, stats]) => ({
        id: String(priority),
        name: PROJECT_PRIORITIES_OPTIONS[priority] || 'Unknown',
        totalTasks: stats.total,
        completedTasks: stats.completed,
        startedTasks: stats.started,
      }))
      .sort((a, b) => Number(b.id) - Number(a.id));

    const projectStats: IStatItem[] = Array.from(projectMap.entries())
      .map(([projectId, stats]) => {
        const project = projects.find((p) => p._id === projectId);
        return {
          id: projectId,
          name:
            project?.name ||
            (projectId === 'no-project' ? 'No Project' : 'Unknown Project'),
          totalTasks: stats.total,
          completedTasks: stats.completed,
          startedTasks: stats.started,
        };
      })
      .filter((item) => item.id !== 'no-project')
      .sort((a, b) => b.totalTasks - a.totalTasks);

    const tagStats: IStatItem[] = Array.from(tagMap.entries())
      .map(([tagId, stats]) => {
        const tag = tagsData?.find((t) => t._id === tagId);
        if (!tag) {
          return null;
        }
        return {
          id: tagId,
          name: tag.name,
          totalTasks: stats.total,
          completedTasks: stats.completed,
          startedTasks: stats.started,
        };
      })
      .filter((item): item is IStatItem => item !== null)
      .sort((a, b) => b.totalTasks - a.totalTasks);

    return {
      totalTasks,
      startedTasks,
      completedTasks,
      priorityStats,
      projectStats,
      tagStats,
    };
  }, [tasks, projects, tagsData]);

  return {
    tasks,
    loading: tasksLoading,
    ...stats,
  };
};
