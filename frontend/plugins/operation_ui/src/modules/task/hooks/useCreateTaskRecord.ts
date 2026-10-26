import { useGetProject } from '@/project/hooks/useGetProject';
import { useCreateTask } from '@/task/hooks/useCreateTask';
import { useTaskDetailSheet } from '@/task/hooks/useTaskDetailSheet';
import { TAddTask } from '@/task/types';
import { useGetCurrentUsersTeams } from '@/team/hooks/useGetCurrentUsersTeams';
import { useToast } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { TASK_CONTENT_TYPE } from '@/task/constants';
import {
  currentUserState,
  IOpenRecordOptions,
  TRelationEntity,
  useSidePanel,
} from 'ui-modules';

// What a task draft starts with: the task's fields and the contacts
// `createTask` links it to.
export type TTaskDraft = Partial<TAddTask> & {
  customerId?: string | null;
  companyId?: string | null;
};

// The contact a task is created from, as the create mutation takes it.
const toContactIds = (linkTo?: TRelationEntity) => ({
  customerId:
    linkTo?.contentType === 'core:customer' ? linkTo.contentId : undefined,
  companyId:
    linkTo?.contentType === 'core:company' ? linkTo.contentId : undefined,
});

/**
 * New tasks start as a draft in the side panel (`openTaskDraft`): its form
 * saves nothing until Save, then `createTaskRecord` creates it in one
 * mutation and the task replaces the draft. A draft starts in the page's
 * team, project and cycle (any `defaults` on top); the backend gives the
 * task the team's first to-do status.
 */
export const useCreateTaskRecord = () => {
  const { t } = useTranslation('operation');
  const { toast } = useToast();
  const { teamId, projectId, cycleId } = useParams<{
    teamId?: string;
    projectId?: string;
    cycleId?: string;
  }>();
  const { teams } = useGetCurrentUsersTeams();
  const { project } = useGetProject(projectId);
  const currentUser = useAtomValue(currentUserState);
  const { createTask, loading } = useCreateTask();
  const [, setActiveTask] = useTaskDetailSheet();
  const { openNewRecord } = useSidePanel();

  /**
   * `linkTo`: the customer or company whose overview it is created from;
   * `createTask` links it, and the draft opens stacked over it.
   */
  const openTaskDraft = (
    defaults: Partial<TAddTask> = {},
    { linkTo }: { linkTo?: TRelationEntity } = {},
  ) => {
    const taskTeamId =
      defaults.teamId || teamId || project?.teamIds?.[0] || teams?.[0]?._id;

    if (!taskTeamId) {
      toast({
        title: t('error'),
        description: t('team-required', 'Join a team to create tasks'),
        variant: 'destructive',
      });
      return;
    }

    const draft: TTaskDraft = {
      priority: 0,
      estimatePoint: 0,
      // Opened from a team, the task is the team's to assign.
      assigneeId: teamId ? undefined : currentUser?._id,
      projectId,
      cycleId,
      ...defaults,
      ...toContactIds(linkTo),
      teamId: taskTeamId,
    };

    openNewRecord(TASK_CONTENT_TYPE, draft, { stack: !!linkTo });
  };

  // Creates a named task (a saved draft, a copy) and opens it in the panel.
  const createTaskRecord = (
    { name, teamId: draftTeamId, ...draft }: TTaskDraft & { name: string },
    options?: IOpenRecordOptions,
  ) => {
    if (loading || !draftTeamId) {
      return;
    }

    // The task keeps its contacts itself; task lists (contacts' included)
    // refetch with every created task.
    createTask({
      variables: { ...draft, name, teamId: draftTeamId },
      onCompleted: ({ createTask: created }) => {
        if (created?._id) {
          setActiveTask(created._id, options);
        }
      },
    });
  };

  return { openTaskDraft, createTaskRecord, loading };
};
