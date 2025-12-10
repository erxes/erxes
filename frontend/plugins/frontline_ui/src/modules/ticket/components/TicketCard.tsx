import { BoardCardProps, Separator } from 'erxes-ui';
import { IconCalendarEventFilled } from '@tabler/icons-react';
import { format } from 'date-fns';
import { Button, TextOverflowTooltip } from 'erxes-ui';
import { useAtomValue, useSetAtom, atom } from 'jotai';
import { SelectStatusTicket } from '@/ticket/components/ticket-selects/SelectStatusTicket';
import { SelectPriorityTicket } from '@/ticket/components/ticket-selects/SelectPriorityTicket';
import { SelectAssigneeTicket } from '@/ticket/components/ticket-selects/SelectAssigneeTicket';
import { SelectDateTicket } from '@/ticket/components/ticket-selects/SelectDateTicket';
import { ticketDetailSheetState } from '@/ticket/states/ticketDetailSheetState';
import { ticketCountByBoardAtom } from '@/ticket/states/ticketsTotalCountState';
import { allTicketsMapState } from '@/ticket/states/allTicketsMapState';

export const ticketBoardItemAtom = atom(
  (get) => (id: string) => get(allTicketsMapState)[id],
);

export const TicketCard = ({ id, column }: BoardCardProps) => {
  const {
    startDate,
    targetDate,
    name,
    number,
    priority,
    _id,
    createdAt,
    pipelineId,
    assigneeId,
  } = useAtomValue(ticketBoardItemAtom)(id);
  const setActiveTicket = useSetAtom(ticketDetailSheetState);
  const setTicketCountByBoard = useSetAtom(ticketCountByBoardAtom);

  return (
    <div onClick={() => setActiveTicket(id)}>
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
          <TextOverflowTooltip
            className="font-semibold max-w-52"
            value={name}
          />
          <div className="text-accent-foreground uppercase">
            Ticket #{number}
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          <SelectStatusTicket
            variant="card"
            value={column}
            onValueChange={(value) =>
              setTicketCountByBoard((prev) => ({
                ...prev,
                [column]: prev[column] - 1 || 0,
                [value]: (prev[value] || 0) + 1,
              }))
            }
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
    </div>
  );
};
