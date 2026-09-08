import { SelectAssigneeTicket } from '@/ticket/components/ticket-selects/SelectAssigneeTicket';
import { SelectDateTicket } from '@/ticket/components/ticket-selects/SelectDateTicket';
import { SelectPriorityTicket } from '@/ticket/components/ticket-selects/SelectPriorityTicket';
import { SelectStatusTicket } from '@/ticket/components/ticket-selects/SelectStatusTicket';
import { SelectTagsTicket } from '@/ticket/components/ticket-selects/SelectTagsTicket';
import { allTicketsMapState } from '@/ticket/states/allTicketsMapState';
import { useTicketDetailSheet } from '@/ticket/hooks/useTicketDetailSheet';
import { ticketCountByBoardAtom } from '@/ticket/states/ticketsTotalCountState';
import { IconCalendarEventFilled } from '@tabler/icons-react';
import { format } from 'date-fns';
import {
  BoardCardProps,
  Button,
  Separator,
  TextOverflowTooltip,
  useQueryState,
} from 'erxes-ui';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { TicketCardDetails } from '@/ticket/components/TicketCardProperties';

export const ticketBoardItemAtom = atom(
  (get) => (id: string) => get(allTicketsMapState)[id],
);

export const TicketCard = ({ id, column }: BoardCardProps) => {
  const { t } = useTranslation('frontline');
  const ticket = useAtomValue(ticketBoardItemAtom)(id);
  const [, setActiveTicket] = useTicketDetailSheet();
  const [, setSelectedTab] = useQueryState<string>('tab');
  const setTicketCountByBoard = useSetAtom(ticketCountByBoardAtom);

  const openTicketTab = (tab: 'overview' | 'properties') => {
    setSelectedTab(tab);
    setActiveTicket(id);
  };

  if (!ticket) {
    return null;
  }

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
    tagIds,
    propertiesData,
  } = ticket;

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
            {t('ticket-number', { number })}
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
          <SelectTagsTicket id={_id} value={tagIds || []} variant="card" />
        </div>
      </div>
      <TicketCardDetails
        tagIds={tagIds || []}
        propertiesData={propertiesData}
        onTagsOverflowClick={() => openTicketTab('overview')}
        onPropertiesOverflowClick={() => openTicketTab('properties')}
      />
      <Separator />
      <div className="h-9 flex items-center justify-between px-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground px-1 hover:bg-background"
        >
          <IconCalendarEventFilled />
          {createdAt && format(new Date(createdAt), 'MMM d, yyyy HH:mm')}
        </Button>
        <SelectAssigneeTicket variant="card" value={assigneeId} id={_id} />
      </div>
    </div>
  );
};
