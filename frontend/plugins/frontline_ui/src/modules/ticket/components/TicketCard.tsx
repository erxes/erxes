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
  Badge,
  BoardCardProps,
  Button,
  Separator,
  TextOverflowTooltip,
  Tooltip,
} from 'erxes-ui';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useGetTags } from 'ui-modules';

export const ticketBoardItemAtom = atom(
  (get) => (id: string) => get(allTicketsMapState)[id],
);

const MAX_VISIBLE_TICKET_TAGS = 5;

const TicketCardTags = ({ tagIds }: { tagIds: string[] }) => {
  const { tags } = useGetTags({ variables: { type: 'frontline:ticket' } });

  const selectedTags = tagIds
    .map((tagId) => tags?.find((tag) => tag._id === tagId))
    .filter((tag): tag is NonNullable<typeof tag> => Boolean(tag));

  if (!selectedTags.length) {
    return null;
  }

  const visibleTags = selectedTags.slice(0, MAX_VISIBLE_TICKET_TAGS);
  const remainingCount = selectedTags.length - visibleTags.length;

  return (
    <Tooltip.Provider>
      <div className="flex flex-wrap gap-1 px-3 pb-3">
        {visibleTags.map((tag) => (
          <Tooltip key={tag._id} delayDuration={200}>
            <Tooltip.Trigger asChild>
              <Badge
                variant="secondary"
                className="h-5 max-w-full cursor-default px-1.5 font-normal"
              >
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: tag.colorCode || '#FF6600' }}
                />
                <span className="truncate">{tag.name}</span>
              </Badge>
            </Tooltip.Trigger>
            <Tooltip.Content>{tag.name}</Tooltip.Content>
          </Tooltip>
        ))}
        {remainingCount > 0 && (
          <Tooltip delayDuration={200}>
            <Tooltip.Trigger asChild>
              <Badge
                variant="ghost"
                className="h-5 cursor-default px-1.5 hover:bg-muted"
              >
                +{remainingCount}
              </Badge>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <div className="flex max-w-64 flex-col gap-1">
                {selectedTags.slice(MAX_VISIBLE_TICKET_TAGS).map((tag) => (
                  <span key={tag._id} className="wrap-break-word">
                    {tag.name}
                  </span>
                ))}
              </div>
            </Tooltip.Content>
          </Tooltip>
        )}
      </div>
    </Tooltip.Provider>
  );
};

export const TicketCard = ({ id, column }: BoardCardProps) => {
  const { t } = useTranslation('frontline');
  const ticket = useAtomValue(ticketBoardItemAtom)(id);
  const [, setActiveTicket] = useTicketDetailSheet();
  const setTicketCountByBoard = useSetAtom(ticketCountByBoardAtom);

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
      <TicketCardTags tagIds={tagIds || []} />
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
