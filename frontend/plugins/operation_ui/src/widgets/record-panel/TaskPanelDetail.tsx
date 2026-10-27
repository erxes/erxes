import type { ApolloCache } from '@apollo/client';
import {
  IconAlignLeft,
  IconCircleCheck,
  IconFlag,
  IconUser,
  IconCalendar,
  IconCalendarDue,
  IconUsersGroup,
  IconBriefcase,
  IconRefresh,
  IconFlag3,
  IconTriangle,
  IconTags,
  IconUsers,
  IconBuilding,
} from '@tabler/icons-react';
import { RecordDescriptionField } from './RecordDescriptionField';
import { compactList } from '@/operation/utils/cursorList';
import { DateSelectTask } from '@/task/components/task-selects/DateSelectTask';
import { SelectAssigneeTask } from '@/task/components/task-selects/SelectAssigneeTask';
import { SelectCycle } from '@/task/components/task-selects/SelectCycle';
import { SelectEstimatedPoint } from '@/task/components/task-selects/SelectEstimatedPointTask';
import { SelectMilestone } from '@/task/components/task-selects/SelectMilestone';
import { SelectProject } from '@/task/components/task-selects/SelectProjectTask';
import { SelectStatusTask } from '@/task/components/task-selects/SelectStatusTask';
import { SelectTaskPriority } from '@/task/components/task-selects/SelectTaskPriority';
import { SelectTeamTask } from '@/task/components/task-selects/SelectTeamTask';
import { TASK_CONTENT_TYPE } from '@/task/constants';
import { useGetTask } from '@/task/hooks/useGetTask';
import { useTaskOptionalFields } from '@/task/hooks/useTaskOptionalFields';
import { useUpdateTask } from '@/task/hooks/useUpdateTask';
import { ITask } from '@/task/types';
import {
  RecordTableInlineCell,
  ScrollArea,
  Spinner,
  TextField,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  PANEL_TEXT_FIELD_CLASS_NAME,
  PanelField,
  TagsSelect,
} from 'ui-modules';
import { RecordContactsField } from './RecordContactsField';

const SCOPE = 'side-panel-task';

// Contacts' task lists change with a task's customer / company; the old
// contact's list is not mounted while the task is open, so it is evicted.
const evictContactTaskLists = (cache: ApolloCache<unknown>) => {
  cache.evict({ id: 'ROOT_QUERY', fieldName: 'getTasks' });
};

const TaskNameField = ({ task }: { task: ITask }) => {
  const { t } = useTranslation('operation');
  const { updateTask } = useUpdateTask();

  return (
    <TextField
      scope={`${SCOPE}.name`}
      value={task.name || ''}
      placeholder={t('task-name')}
      className={PANEL_TEXT_FIELD_CLASS_NAME}
      onSave={(name) => updateTask({ variables: { _id: task._id, name } })}
    />
  );
};

// The task's fields as record table cells: click a value to edit it.
export const TaskPanelDetail = ({ taskId }: { taskId: string }) => {
  const { t } = useTranslation('operation');
  const { task, loading } = useGetTask(taskId);
  const { updateTask } = useUpdateTask();
  const { showCycle, showEstimate, showMilestone } = useTaskOptionalFields({
    teamId: task?.teamId,
    projectId: task?.projectId,
  });

  if (loading && !task) {
    return <Spinner containerClassName="py-12" />;
  }

  if (!task) {
    return null;
  }

  const {
    _id,
    teamId,
    status,
    priority,
    assigneeId,
    startDate,
    targetDate,
    projectId,
    cycleId,
    milestoneId,
    estimatePoint,
    tagIds,
  } = task;

  // Radix sizes its content as a table, which lets wide values push past the
  // panel; a block lets each value shrink and truncate instead.
  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <div className="grid gap-5 p-3 @3xl/record-panel:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)] @3xl/record-panel:p-6">
        <div className="flex min-w-0 flex-col gap-1">
          <PanelField icon={IconAlignLeft} label={t('name', 'Name')}>
            <TaskNameField task={task} />
          </PanelField>
          <PanelField icon={IconCircleCheck} label={t('status')}>
            <SelectStatusTask
              variant="table"
              teamId={teamId}
              value={status}
              id={_id}
            />
          </PanelField>
          <PanelField icon={IconFlag} label={t('priority')}>
            <SelectTaskPriority taskId={_id} value={priority} variant="table" />
          </PanelField>
          <PanelField icon={IconUser} label={t('assignee')}>
            <SelectAssigneeTask
              variant="table"
              id={_id}
              value={assigneeId}
              teamIds={teamId ? [teamId] : undefined}
              scope={`${SCOPE}.assignee`}
            />
          </PanelField>
          <PanelField icon={IconCalendar} label={t('start-date')}>
            <DateSelectTask type="startDate" value={startDate} id={_id} />
          </PanelField>
          <PanelField icon={IconCalendarDue} label={t('due-date')}>
            <DateSelectTask type="targetDate" value={targetDate} id={_id} />
          </PanelField>
          <PanelField icon={IconUsersGroup} label={t('team')}>
            <SelectTeamTask taskId={_id} value={teamId || ''} variant="table" />
          </PanelField>
          <PanelField icon={IconBriefcase} label={t('project')}>
            <SelectProject
              value={projectId}
              taskId={_id}
              teamId={teamId}
              variant="table"
            />
          </PanelField>
          {showCycle && (
            <PanelField icon={IconRefresh} label={t('cycle')}>
              <SelectCycle
                taskId={_id}
                value={cycleId || ''}
                teamId={teamId}
                variant="table"
              />
            </PanelField>
          )}
          {showMilestone && (
            <PanelField icon={IconFlag3} label={t('milestone')}>
              <SelectMilestone
                value={milestoneId || ''}
                taskId={_id}
                projectId={projectId}
                variant="table"
              />
            </PanelField>
          )}
          {showEstimate && (
            <PanelField icon={IconTriangle} label={t('estimate')}>
              <SelectEstimatedPoint
                taskId={_id}
                value={estimatePoint}
                teamId={teamId}
                variant="table"
              />
            </PanelField>
          )}
          <PanelField icon={IconTags} label={t('tags')}>
            <TagsSelect.Provider
              type={TASK_CONTENT_TYPE}
              mode="multiple"
              value={compactList(tagIds)}
              targetIds={[_id]}
              options={(newSelectedTagIds) => ({
                update: (cache) => {
                  cache.modify({
                    id: cache.identify({ __typename: 'Task', _id }),
                    fields: { tagIds: () => newSelectedTagIds },
                  });
                },
              })}
            >
              <RecordTableInlineCell.Trigger className="rounded-sm font-normal">
                {compactList(tagIds).length ? (
                  <div className="flex min-w-0 flex-wrap gap-1">
                    <TagsSelect.SelectedList />
                  </div>
                ) : (
                  <span className="text-muted-foreground">
                    {t('add-tags', 'Add tags')}
                  </span>
                )}
              </RecordTableInlineCell.Trigger>
              <RecordTableInlineCell.Content>
                <TagsSelect.Content />
              </RecordTableInlineCell.Content>
            </TagsSelect.Provider>
          </PanelField>
          <PanelField icon={IconUsers} label={t('customer', 'Customer')}>
            <RecordContactsField
              kind="customer"
              value={task.customerId}
              scope={`${SCOPE}.customer`}
              onValueChange={(customerId) =>
                updateTask({
                  variables: { _id, customerId },
                  update: evictContactTaskLists,
                })
              }
            />
          </PanelField>
          <PanelField icon={IconBuilding} label={t('company', 'Company')}>
            <RecordContactsField
              kind="company"
              value={task.companyId}
              scope={`${SCOPE}.company`}
              onValueChange={(companyId) =>
                updateTask({
                  variables: { _id, companyId },
                  update: evictContactTaskLists,
                })
              }
            />
          </PanelField>
        </div>
        <RecordDescriptionField
          key={_id}
          value={task.description || ''}
          onSave={(description) =>
            updateTask({ variables: { _id, description } })
          }
        />
      </div>
    </ScrollArea>
  );
};
