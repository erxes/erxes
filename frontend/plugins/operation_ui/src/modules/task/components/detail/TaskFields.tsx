import type { TaskFieldsProps } from '@/task/types/taskFields';
import { compactList } from '@/operation/utils/cursorList';
import { useTranslation } from 'react-i18next';
import { OperationTagsChip } from '@/operation/components/OperationChips';
import { ActivityList } from '@/activity/components/ActivityList';
import { DateSelectTask } from '@/task/components/task-selects/DateSelectTask';
import { SelectAssigneeTask } from '@/task/components/task-selects/SelectAssigneeTask';
import { SelectCycle } from '@/task/components/task-selects/SelectCycle';
import { SelectEstimatedPoint } from '@/task/components/task-selects/SelectEstimatedPointTask';
import { SelectMilestone } from '@/task/components/task-selects/SelectMilestone';
import { SelectProject } from '@/task/components/task-selects/SelectProjectTask';
import { SelectStatusTask } from '@/task/components/task-selects/SelectStatusTask';
import { SelectTaskPriority } from '@/task/components/task-selects/SelectTaskPriority';
import { SelectTeamTask } from '@/task/components/task-selects/SelectTeamTask';
import { BlockEditor, Separator, Textarea, Button, Spinner } from 'erxes-ui';
import { IconBrandGithub, IconExternalLink } from '@tabler/icons-react';
import { useTaskFieldsEditor } from '@/task/hooks/useTaskFieldsEditor';
import { useTaskOptionalFields } from '@/task/hooks/useTaskOptionalFields';

export const TaskFields = ({ task, titleAction }: TaskFieldsProps) => {
  const { t } = useTranslation('operation');
  const {
    _id: taskId,
    teamId,
    priority,
    status,
    assigneeId,
    targetDate,
    projectId,
    estimatePoint,
    cycleId,
    milestoneId,
    tagIds,
    githubIssueNumber,
    githubIssueUrl,
    githubRepoName,
  } = task || {};

  const startDate = task.startDate;
  const { showCycle, showEstimate, showMilestone } = useTaskOptionalFields({
    teamId,
    projectId,
  });
  const {
    name,
    setName,
    editor,
    isDescriptionReady,
    textareaRef,
    handleDescriptionChange,
  } = useTaskFieldsEditor({
    task,
    descriptionPlaceholder: t('description-placeholder'),
  });

  return (
    <div className="flex flex-col gap-3">
      {githubIssueNumber && githubIssueUrl && (
        <Button
          asChild
          variant="outline"
          size="sm"
          className="w-fit text-muted-foreground group"
        >
          <a href={githubIssueUrl} target="_blank" rel="noopener noreferrer">
            <IconBrandGithub className="size-4 shrink-0" />
            <span className="text-muted-foreground">Synced with GitHub</span>
            <span className="font-normal">
              {githubRepoName ? `${githubRepoName} ` : ''}#{githubIssueNumber}
            </span>
            <IconExternalLink className="size-3.5 shrink-0 opacity-60 transition-opacity group-hover:opacity-100" />
          </a>
        </Button>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Textarea
            ref={textareaRef}
            className="shadow-none focus-visible:shadow-none p-0"
            style={{ fontSize: '1.25rem', lineHeight: '1.75rem' }}
            placeholder={t('task-name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        {titleAction}
      </div>
      <div className="gap-2 flex flex-wrap w-full items-center">
        <SelectStatusTask
          variant="detail"
          value={status}
          id={taskId}
          teamId={teamId}
          label={t('status')}
        />
        <SelectTaskPriority
          taskId={taskId}
          value={priority}
          variant="detail"
          label={t('priority')}
        />
        <SelectAssigneeTask
          variant="detail"
          value={assigneeId}
          id={taskId}
          teamIds={teamId ? [teamId] : undefined}
          label={t('assignee')}
        />
        <DateSelectTask
          value={startDate}
          id={taskId}
          type="startDate"
          variant="input"
          label={t('start-date')}
        />
        <DateSelectTask
          value={targetDate}
          id={taskId}
          type="targetDate"
          variant="input"
          label={t('due-date')}
        />
        <SelectTeamTask
          taskId={taskId}
          value={teamId || ''}
          variant="detail"
          label={t('team')}
        />
        {showCycle && (
          <SelectCycle
            value={cycleId || ''}
            taskId={taskId}
            variant="detail"
            teamId={teamId}
            label={t('cycle')}
          />
        )}
        <SelectProject
          value={projectId}
          taskId={taskId}
          variant="detail"
          teamId={teamId}
          label={t('project')}
        />
        {showEstimate && (
          <SelectEstimatedPoint
            value={estimatePoint}
            taskId={taskId}
            teamId={teamId}
            variant="detail"
            label={t('estimate')}
          />
        )}
        {showMilestone && (
          <SelectMilestone
            value={milestoneId || ''}
            taskId={taskId}
            projectId={projectId}
            variant="detail"
            label={t('milestone')}
          />
        )}
        <OperationTagsChip
          type="operation:task"
          targetIds={[taskId]}
          value={compactList(tagIds)}
          label={t('tags')}
        />
      </div>
      <Separator className="mb-4 mt-2" />
      <div className="min-h-56 overflow-y-auto">
        {isDescriptionReady ? (
          <BlockEditor
            editor={editor}
            onChange={handleDescriptionChange}
            className="min-h-full read-only"
          />
        ) : (
          <Spinner />
        )}
      </div>
      <ActivityList contentId={taskId} contentDetail={task} />
    </div>
  );
};
