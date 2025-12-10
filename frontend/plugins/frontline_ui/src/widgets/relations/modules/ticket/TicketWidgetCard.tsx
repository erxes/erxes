import { SelectDateTicket } from '@/ticket/components/ticket-selects/SelectDateTicket';
import { SelectAssigneeTicket } from '@/ticket/components/ticket-selects/SelectAssigneeTicket';
import { SelectStatusTicket } from '@/ticket/components/ticket-selects/SelectStatusTicket';
import { SelectPriorityTicket } from '@/ticket/components/ticket-selects/SelectPriorityTicket';
import { ticketDetailSheetState } from '@/ticket/states/ticketDetailSheetState';
import { ITicket } from '@/ticket/types';
import { IconCalendarEventFilled } from '@tabler/icons-react';
import { format } from 'date-fns';
import { Button, Card, Separator } from 'erxes-ui';
import { useAtom } from 'jotai';
import { lazy, Suspense } from 'react';

const TicketDetailSheet = lazy(() =>
  import('@/ticket/components/ticket-detail/TicketDetailSheet').then(
    (module) => ({
      default: module.TicketDetailSheet,
    }),
  ),
);

export const TicketWidgetCard = ({ ticket }: { ticket: ITicket }) => {
  const {
    startDate,
    targetDate,
    name,
    number,
    priority,
    assigneeId,
    _id,
    statusId,
    pipelineId,
    createdAt,
  } = ticket || {};
  const [activeTicket, setActiveTicket] = useAtom(ticketDetailSheetState);

  return (
    <>
      <Card onClick={() => setActiveTicket(_id)}>
        <div className="flex items-center justify-between h-9 px-1.5">
          <SelectDateTicket
            value={startDate}
            id={_id}
            type="startDate"
            variant="card"
          />
          <SelectDateTicket
            value={targetDate}
            id={_id}
            type="targetDate"
            variant="card"
          />
        </div>
        <Separator />
        <div className="p-3 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h5 className="font-semibold">{name}</h5>
            <div className="text-accent-foreground uppercase">
              Ticket #{number}
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            <SelectStatusTicket
              variant="card"
              value={statusId}
              id={_id}
              pipelineId={pipelineId}
            />
            <SelectPriorityTicket id={_id} value={priority} variant="card" />
          </div>
        </div>
        <Separator />
        <div className="h-9 flex items-center justify-between px-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground px-1 hover:bg-background"
          >
            <IconCalendarEventFilled />
            {createdAt && format(new Date(createdAt), 'MMM dd, yyyy')}
          </Button>
          <SelectAssigneeTicket variant="card" value={assigneeId} id={_id} />
        </div>
      </Card>
      <Suspense>{activeTicket && <TicketDetailSheet />}</Suspense>
    </>
  );
};
