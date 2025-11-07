import { useGetTicketStatusesByPipeline } from '@/status/hooks/useGetTicketStatus';
import { useTickets } from '@/ticket/hooks/useGetTickets';
import { ITicket } from '@/ticket/types';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  Board,
  BoardColumnProps,
  BoardItemProps,
  Button,
  EnumCursorDirection,
  Skeleton,
  SkeletonArray,
  useQueryState,
  Spinner,
} from 'erxes-ui';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { TicketCard } from '@/ticket/components/TicketCard';
import { useUpdateTicket } from '@/ticket/hooks/useUpdateTicket';
import clsx from 'clsx';
import { ticketCountByBoardAtom } from '@/ticket/states/ticketsTotalCountState';
import { IconBrandTrello, IconPlus, IconSettings } from '@tabler/icons-react';
import {
  ticketCreateDefaultValuesState,
  ticketCreateSheetState,
} from '@/ticket/states/ticketCreateSheetState';
import { useInView } from 'react-intersection-observer';
import { StatusInlineIcon } from '@/status/components/StatusInline';
import { allTicketsMapState } from '@/ticket/states/allTicketsMapState';
import { Link } from 'react-router-dom';
const fetchedTicketsState = atom<BoardItemProps[]>([]);

export const TicketsBoard = () => {
  const [pipelineId] = useQueryState<string | null>('pipelineId');
  const [channelId] = useQueryState<string | null>('channelId');
  const allTicketsMap = useAtomValue(allTicketsMapState);
  const { updateTicket } = useUpdateTicket();

  const { statuses, loading } = useGetTicketStatusesByPipeline({
    variables: {
      pipelineId: pipelineId || '',
    },
  });

  const columns = statuses?.map((status) => ({
    id: status.value,
    name: status.label,
    type: status.type.toString(),
    color: status.color,
  }));

  const [tickets, setTickets] = useAtom(fetchedTicketsState);
  const setTicketCountByBoard = useSetAtom(ticketCountByBoardAtom);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      return;
    }
    const activeItem = allTicketsMap[active.id as string];
    const overItem = allTicketsMap[over.id as string];
    const overColumn =
      overItem?.statusId ||
      columns?.find((col) => col.id === over.id)?.id ||
      columns?.[0]?.id;

    if (activeItem?.statusId === overColumn) {
      return;
    }
    updateTicket({
      variables: {
        _id: activeItem?._id,
        statusId: overColumn,
      },
    });
    setTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.id === activeItem?._id) {
          return {
            ...ticket,
            column: overColumn,
            sort: new Date().toISOString(),
          };
        }
        return ticket;
      }),
    );
    setTicketCountByBoard((prev) => ({
      ...prev,
      [activeItem?.statusId]: prev[activeItem?.statusId] - 1 || 0,
      [overColumn]: (prev[overColumn] || 0) + 1,
    }));
  };
  if (loading) return <Spinner />;
  return (
    <Board.Provider
      columns={columns}
      data={tickets}
      onDragEnd={handleDragEnd}
      boardId={clsx('tickets-board', pipelineId)}
      fallbackComponent={
        <div className="flex h-full w-full flex-col items-center justify-center text-center p-6 gap-2">
          <IconBrandTrello
            size={64}
            stroke={1.5}
            className="text-muted-foreground"
          />
          <h2 className="text-lg font-semibold text-muted-foreground">
            No pipeline yet
          </h2>
          <p className="text-md text-muted-foreground mb-4">
            Create a pipeline to start organizing your board.
          </p>
          <Button variant="outline" asChild>
            <Link to={`/settings/frontline/channels/${channelId}/pipelines`}>
              <IconSettings />
              Go to settings
            </Link>
          </Button>
        </div>
      }
    >
      {(column) => (
        <Board id={column.id} key={column.id} sortBy="updated">
          <TicketsBoardCards column={column} />
        </Board>
      )}
    </Board.Provider>
  );
};

export const TicketsBoardCards = ({ column }: { column: BoardColumnProps }) => {
  const [ticketCards, setTicketCards] = useAtom(fetchedTicketsState);
  const [ticketCountByBoard, setTicketCountByBoard] = useAtom(
    ticketCountByBoardAtom,
  );

  const boardCards = ticketCards
    .filter((ticket) => ticket.column === column.id)
    .sort((a, b) => {
      if (a.sort && b.sort) {
        return b.sort.toString().localeCompare(a.sort.toString());
      }
      return 0;
    });
  const { tickets, totalCount, loading, handleFetchMore } = useTickets({
    variables: {
      statusId: column.id,
    },
  });
  const setAllticketsMap = useSetAtom(allTicketsMapState);

  useEffect(() => {
    if (tickets) {
      setTicketCards((prev) => {
        const previoustickets = prev.filter(
          (ticket) => !tickets.some((t) => t._id === ticket.id),
        );
        return [
          ...previoustickets,
          ...tickets.map((ticket) => ({
            id: ticket._id,
            column: ticket.statusId,
            sort: ticket.updatedAt,
          })),
        ];
      });
      setAllticketsMap((prev) => {
        const newtickets = tickets.reduce((acc, ticket) => {
          acc[ticket._id] = ticket;
          return acc;
        }, {} as Record<string, ITicket>);
        return { ...prev, ...newtickets };
      });
    }
  }, [tickets, setTicketCards, setAllticketsMap, column.id]);

  useEffect(() => {
    if (totalCount) {
      setTicketCountByBoard((prev) => ({
        ...prev,
        [column.id]: totalCount || 0,
      }));
    }
  }, [totalCount, setTicketCountByBoard, column.id]);

  return (
    <>
      <Board.Header>
        <h4 className="capitalize flex items-center gap-1 pl-1">
          <StatusInlineIcon statusType={column.type} />
          {column.name}
          <span className="text-accent-foreground font-medium pl-1">
            {loading ? (
              <Skeleton className="size-4 rounded" />
            ) : (
              ticketCountByBoard[column.id] || 0
            )}
          </span>
        </h4>
        <TicketCreateSheetTrigger statusId={column.id} />
      </Board.Header>
      <Board.Cards id={column.id} items={boardCards.map((ticket) => ticket.id)}>
        {loading ? (
          <SkeletonArray
            className="p-24 w-full rounded shadow-xs opacity-80"
            count={10}
          />
        ) : (
          boardCards.map((ticket) => (
            <Board.Card
              key={ticket.id}
              id={ticket.id}
              name={ticket.name}
              column={column.id}
            >
              <TicketCard id={ticket.id} column={column.id} />
            </Board.Card>
          ))
        )}
        <TicketCardsFetchMore
          totalCount={ticketCountByBoard[column.id] || 0}
          currentLength={boardCards.length}
          handleFetchMore={() =>
            handleFetchMore({ direction: EnumCursorDirection.FORWARD })
          }
        />
      </Board.Cards>
    </>
  );
};

export const TicketCardsFetchMore = ({
  totalCount,
  handleFetchMore,
  currentLength,
}: {
  totalCount: number;
  handleFetchMore: () => void;
  currentLength: number;
}) => {
  const { ref: bottomRef } = useInView({
    onChange: (inView) => inView && handleFetchMore(),
  });

  if (!totalCount || currentLength >= totalCount || currentLength === 0) {
    return null;
  }

  return (
    <div ref={bottomRef}>
      <Skeleton className="p-12 w-full rounded shadow-xs opacity-80" />
    </div>
  );
};

const TicketCreateSheetTrigger = ({ statusId }: { statusId: string }) => {
  const setOpenCreateticket = useSetAtom(ticketCreateSheetState);
  const setDefaultValues = useSetAtom(ticketCreateDefaultValuesState);

  const handleClick = () => {
    setDefaultValues({ statusId });
    setOpenCreateticket(true);
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleClick}>
      <IconPlus />
    </Button>
  );
};
