import { Button, Card, Separator } from 'erxes-ui';
import { Suspense, lazy } from 'react';

import { DateSelectDeal } from '@/deals/components/deal-selects/DateSelectDeal';
import { IDeal } from '@/deals/types/deals';
import { IconCalendarEventFilled } from '@tabler/icons-react';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { format } from 'date-fns';
import { useAtom } from 'jotai';

export const DealWidgetCard = ({ deal }: { deal: IDeal }) => {
  const {
    startDate,
    closeDate,
    name,
    number,
    priority,
    _id,
    status,
    createdAt,
  } = deal || {};
  const [activeTask, setActiveTask] = useAtom(dealDetailSheetState);

  return (
    <>
      <Card className="bg-background" onClick={() => setActiveTask(_id)}>
        <div className="px-2 h-9 flex flex-row items-center justify-between space-y-0">
          <DateSelectDeal
            value={startDate}
            id={_id}
            type="startDate"
            variant="card"
          />
          <DateSelectDeal
            value={closeDate}
            id={_id}
            type="closeDate"
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
