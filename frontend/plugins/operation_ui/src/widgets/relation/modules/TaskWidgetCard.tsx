import { DateSelectTask } from '@/task/components/task-selects/DateSelectTask';
import { SelectAssigneeTask } from '@/task/components/task-selects/SelectAssigneeTask';
import { SelectEstimatedPoint } from '@/task/components/task-selects/SelectEstimatedPointTask';
import { SelectProject } from '@/task/components/task-selects/SelectProjectTask';
import { SelectStatusTask } from '@/task/components/task-selects/SelectStatusTask';
import { SelectTaskPriority } from '@/task/components/task-selects/SelectTaskPriority';
import { SelectTeamTask } from '@/task/components/task-selects/SelectTeamTask';
import { taskDetailSheetState } from '@/task/states/taskDetailSheetState';
import { ITask } from '@/task/types';
import { IconCalendarEventFilled } from '@tabler/icons-react';
import { format } from 'date-fns';
import { Button, Card, Separator } from 'erxes-ui';
import { useAtom } from 'jotai';
import { lazy, Suspense } from 'react';

const TaskDetailSheet = lazy(() =>
  import('@/task/components/TaskDetailSheet').then((module) => ({
    default: module.TaskDetailSheet,
  })),
);

export const TaskWidgetCard = ({ task }: { task: ITask }) => {
  const {
    startDate,
    targetDate,
    name,
    number,
    priority,
    teamId,
    assigneeId,
    projectId,
    estimatePoint,
    _id,
    status,
    createdAt,
  } = task || {};
  const [activeTask, setActiveTask] = useAtom(taskDetailSheetState);

  return (
    <>
      <Card className="bg-background" onClick={() => setActiveTask(_id)}>
        <div className="px-2 h-9 flex flex-row items-center justify-between space-y-0">
          <DateSelectTask
            value={startDate}
            id={_id}
            type="startDate"
            variant="card"
          />
          <DateSelectTask
            value={targetDate}
            id={_id}
            type="targetDate"
            variant="card"
          />
        </div>
        <Separator />
        <div className="p-3">
          <div className="flex flex-col gap-1">
            <h5 className="font-semibold">{name}</h5>
            <div className="text-sm text-accent-foreground uppercase">
              Task #{number}
            </div>
          </div>
          <div className="flex flex-wrap gap-1 pt-2 pb-1">
            <SelectStatusTask
              variant="card"
              value={status}
              id={_id}
              teamId={teamId}
            />
            <SelectTaskPriority taskId={_id} value={priority} variant="card" />
            <SelectTeamTask variant="card" taskId={_id} value={teamId} />
            <SelectProject value={projectId} taskId={_id} variant="card" />
            <SelectEstimatedPoint
              taskId={_id}
              value={estimatePoint}
              teamId={teamId}
              variant="card"
            />
          </div>
        </div>
        <Separator />
        <div className="h-9 px-2 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground px-1 hover:bg-background pointer-events-none"
          >
            <IconCalendarEventFilled />
            Created on:{' '}
            {createdAt && format(new Date(createdAt), 'MMM dd, yyyy')}
          </Button>
          <SelectAssigneeTask
            variant="card"
            value={assigneeId}
            id={_id}
            teamIds={teamId ? [teamId] : undefined}
          />
        </div>
      </Card>
      <Suspense>{activeTask && <TaskDetailSheet />}</Suspense>
    </>
  );
};
