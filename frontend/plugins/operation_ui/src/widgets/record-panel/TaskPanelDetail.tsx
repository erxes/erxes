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
import { ScrollArea, Spinner, TextField } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  PANEL_TEXT_FIELD_CLASS_NAME,
  PanelDescriptionField,
  PanelField,
  TagsSelect,
} from 'ui-modules';
import { RecordContactsField } from './RecordContactsField';

const SCOPE = 'side-panel-task';

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
      <div className="flex flex-col gap-0.5 p-3">
        <PanelField label={t('name', 'Name')}>
          <TaskNameField task={task} />
        </PanelField>
        <PanelField label={t('status')}>
          <SelectStatusTask
            variant="table"
            teamId={teamId}
            value={status}
            id={_id}
          />
        </PanelField>
        <PanelField label={t('priority')}>
          <SelectTaskPriority taskId={_id} value={priority} variant="table" />
        </PanelField>
        <PanelField label={t('assignee')}>
          <SelectAssigneeTask
            variant="table"
            id={_id}
            value={assigneeId}
            teamIds={teamId ? [teamId] : undefined}
            scope={`${SCOPE}.assignee`}
          />
        </PanelField>
        <PanelField label={t('start-date')}>
          <DateSelectTask type="startDate" value={startDate} id={_id} />
        </PanelField>
        <PanelField label={t('due-date')}>
          <DateSelectTask type="targetDate" value={targetDate} id={_id} />
        </PanelField>
        <PanelField label={t('team')}>
          <SelectTeamTask taskId={_id} value={teamId || ''} variant="table" />
        </PanelField>
        <PanelField label={t('project')}>
          <SelectProject
            value={projectId}
            taskId={_id}
            teamId={teamId}
            variant="table"
          />
        </PanelField>
        {showCycle && (
          <PanelField label={t('cycle')}>
            <SelectCycle
              taskId={_id}
              value={cycleId || ''}
              teamId={teamId}
              variant="table"
            />
          </PanelField>
        )}
        {showMilestone && (
          <PanelField label={t('milestone')}>
            <SelectMilestone
              value={milestoneId || ''}
              taskId={_id}
              projectId={projectId}
              variant="table"
            />
          </PanelField>
        )}
        {showEstimate && (
          <PanelField label={t('estimate')}>
            <SelectEstimatedPoint
              taskId={_id}
              value={estimatePoint}
              teamId={teamId}
              variant="table"
            />
          </PanelField>
        )}
        <PanelField label={t('tags')}>
          <TagsSelect.InlineCell
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
          />
        </PanelField>
        <PanelField label={t('customers', 'Customers')}>
          <RecordContactsField
            kind="customer"
            value={task.customerId}
            scope={`${SCOPE}.customer`}
            onValueChange={(customerId) =>
              updateTask({ variables: { _id, customerId } })
            }
          />
        </PanelField>
        <PanelField label={t('companies', 'Companies')}>
          <RecordContactsField
            kind="company"
            value={task.companyId}
            scope={`${SCOPE}.company`}
            onValueChange={(companyId) =>
              updateTask({ variables: { _id, companyId } })
            }
          />
        </PanelField>
        <PanelDescriptionField
          key={_id}
          label={t('description', 'Description')}
          value={task.description || ''}
          scope={`${SCOPE}.description`}
          onSave={(description) =>
            updateTask({ variables: { _id, description } })
          }
        />
      </div>
    </ScrollArea>
  );
};
