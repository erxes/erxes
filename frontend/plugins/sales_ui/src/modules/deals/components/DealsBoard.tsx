import {
  Board,
  BoardColumnProps,
  BoardItemProps,
  Button,
  EnumCursorDirection,
  Skeleton,
  SkeletonArray,
  useQueryState,
} from 'erxes-ui';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  dealCreateDefaultValuesState,
  dealCreateSheetState,
} from '@/deals/states/dealCreateSheetState';
import { useDeals, useDealsChange } from '@/deals/cards/hooks/useDeals';

import { DealsBoardCard } from '@/deals/components/DealsBoardCard';
import type { DragEndEvent } from '@dnd-kit/core';
import { IDeal } from '@/deals/types/deals';
import { IconPlus } from '@tabler/icons-react';
import clsx from 'clsx';
import { dealCountByBoardAtom } from '@/deals/states/dealsTotalCountState';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useSearchParams } from 'react-router';
import { useStages } from '@/deals/stage/hooks/useStages';

const fetchedDealsState = atom<BoardItemProps[]>([]);
export const allDealsMapState = atom<Record<string, IDeal>>({});

export const DealsBoard = () => {
  const allDealsMap = useAtomValue(allDealsMapState);
  const { changeDeals } = useDealsChange();
  const [pipelineId] = useQueryState<string>('pipelineId');

  const { stages } = useStages({
    variables: {
      pipelineId,
    },
    skip: !pipelineId,
  });

  const columns = stages?.map((stage) => ({
    id: stage._id,
    name: stage.name,
    type: stage.type,
  }));

  const [deals, setDeals] = useAtom(fetchedDealsState);
  const setDealCountByBoard = useSetAtom(dealCountByBoardAtom);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    setDealCountByBoard({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipelineId, searchParams.toString()]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeItem = allDealsMap[active.id as string];
    const overItem = allDealsMap[over.id as string];

    if (!activeItem) return;

    const overColumn =
      overItem?.stageId ||
      columns.find((col) => col.id === over.id)?.id ||
      columns[0]?.id;

    let aboveItemId: string | null = null;

    setDeals((prev) => {
      let updated = [...prev];

      // If moved to a different column
      if (activeItem.stageId !== overColumn) {
        updated = updated.map((deal) =>
          deal.id === activeItem._id
            ? { ...deal, column: overColumn, sort: new Date().toISOString() }
            : deal,
        );

        const columnItems = updated
          .filter((d) => d.column === overColumn && d.id !== activeItem._id)
          .sort((a, b) =>
            (a.sort?.toString() ?? '').localeCompare(b.sort?.toString() ?? ''),
          );

        const overIndex = columnItems.findIndex((c) => c.id === overItem?._id);

        aboveItemId =
          overIndex === -1
            ? columnItems[columnItems.length - 1]?.id ?? null
            : columnItems[overIndex]?.id;
      } else {
        const columnItems = updated
          .filter((d) => d.column === overColumn && d.id !== activeItem._id)
          .sort((a, b) =>
            (a.sort?.toString() ?? '').localeCompare(b.sort?.toString() ?? ''),
          );

        const overIndex = columnItems.findIndex((c) => c.id === overItem?._id);
        aboveItemId =
          overIndex === -1
            ? columnItems[columnItems.length - 1]?.id ?? null
            : columnItems[overIndex]?.id;

        // Remove active item from old position
        const fromIndex = updated.findIndex((d) => d.id === activeItem._id);
        updated.splice(fromIndex, 1);

        // Insert active item in new position
        const insertIndex =
          overIndex === -1
            ? updated.filter((d) => d.column === overColumn).length
            : updated.findIndex((d) => d.id === columnItems[overIndex].id);

        updated.splice(insertIndex, 0, {
          id: activeItem._id,
          column: overColumn,
          sort: new Date().toISOString(),
        });
      }

      return updated;
    });

    changeDeals({
      variables: {
        itemId: activeItem._id,
        destinationStageId: overColumn,
        aboveItemId: aboveItemId ?? undefined,
      },
    });

    setDealCountByBoard((prev) => ({
      ...prev,
      [activeItem?.stageId]: prev[activeItem?.stageId] - 1 || 0,
      [overColumn]: (prev[overColumn] || 0) + 1,
    }));
  };

  return (
    <Board.Provider
      columns={columns}
      data={deals}
      onDragEnd={handleDragEnd}
      boardId={clsx('deals-board', pipelineId)}
    >
      {(column) => (
        <Board id={column.id} key={column.id} sortBy="updated">
          <DealsBoardCards column={column} />
        </Board>
      )}
    </Board.Provider>
  );
};

export const DealsBoardCards = ({ column }: { column: BoardColumnProps }) => {
  const [pipelineId] = useQueryState('pipelineId');

  const [dealCards, setDealCards] = useAtom(fetchedDealsState);
  const [dealCountByBoard, setDealCountByBoard] = useAtom(dealCountByBoardAtom);
  const [searchParams] = useSearchParams();

  const ignoredKeys = ['boardId', 'pipelineId', 'salesItemId', 'tab'];

  const queryVariables: Record<string, any> = {};

  for (const [key, value] of searchParams.entries()) {
    if (ignoredKeys.includes(key)) continue;

    try {
      const parsed = JSON.parse(value);
      queryVariables[key] = parsed;
    } catch {
      queryVariables[key] = value;
    }
  }

  const boardCards = dealCards
    .filter((deal) => deal.column === column.id)
    .sort((a, b) => {
      if (a.sort && b.sort) {
        return b.sort.toString().localeCompare(a.sort.toString());
      }
      return 0;
    });

  const { deals, totalCount, loading, handleFetchMore } = useDeals({
    variables: {
      stageId: column.id,
      pipelineId,
      ...queryVariables,
    },
  });

  const setAllDealsMap = useSetAtom(allDealsMapState);

  useEffect(() => {
    if (deals && deals.length !== 0) {
      setDealCards((prev) => {
        const previousDeals = prev.filter(
          (deal) => !deals.some((t) => t._id === deal.id),
        );

        return [
          ...previousDeals,
          ...deals.map((deal) => ({
            id: deal._id,
            column: deal.stageId,
            sort: deal.createdAt,
          })),
        ];
      });
      setAllDealsMap((prev) => {
        const newDeals = deals.reduce((acc, deal) => {
          acc[deal._id] = deal;
          return acc;
        }, {} as Record<string, IDeal>);
        return { ...prev, ...newDeals };
      });
    } else {
      setDealCards((prev) => prev.filter((d) => d.column !== column.id));
    }
  }, [deals, setDealCards, setAllDealsMap, column.id]);

  useEffect(() => {
    if (totalCount) {
      setDealCountByBoard((prev) => ({
        ...prev,
        [column.id]: totalCount,
      }));
    }
  }, [totalCount, setDealCountByBoard, column.id]);

  return (
    <>
      <Board.Header>
        <h4 className="capitalize flex items-center gap-1 pl-1">
          {column.name}
          <span className="text-accent-foreground font-medium pl-1">
            {loading ? (
              <Skeleton className="size-4 rounded" />
            ) : (
              totalCount || 0
            )}
          </span>
        </h4>
        <DealCreateSheetTrigger stageId={column.id} />
      </Board.Header>
      <Board.Cards id={column.id} items={boardCards.map((deal) => deal.id)}>
        {loading ? (
          <SkeletonArray
            className="p-24 w-full rounded shadow-xs opacity-80"
            count={10}
          />
        ) : (
          boardCards.map((deal) => (
            <Board.Card
              key={deal.id}
              id={deal.id}
              name={deal.name}
              column={column.id}
            >
              <DealsBoardCard id={deal.id} column={column.id} />
            </Board.Card>
          ))
        )}
        <DealCardsFetchMore
          totalCount={dealCountByBoard[column.id] || 0}
          currentLength={boardCards.length}
          handleFetchMore={() =>
            handleFetchMore({ direction: EnumCursorDirection.FORWARD })
          }
        />
      </Board.Cards>
    </>
  );
};

export const DealCardsFetchMore = ({
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

const DealCreateSheetTrigger = ({ stageId }: { stageId: string }) => {
  const setOpenCreateDeal = useSetAtom(dealCreateSheetState);
  const setDefaultValues = useSetAtom(dealCreateDefaultValuesState);

  const handleClick = () => {
    setDefaultValues({ stageId });
    setOpenCreateDeal(true);
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleClick}>
      <IconPlus />
    </Button>
  );
};
