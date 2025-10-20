import {
  Board,
  BoardColumnProps,
  BoardItemProps,
  EnumCursorDirection,
  Skeleton,
  SkeletonArray,
  useQueryState,
} from 'erxes-ui';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useDeals, useDealsChange } from '@/deals/cards/hooks/useDeals';

import { DealsBoardCard } from '@/deals/boards/components/DealsBoardCard';
import { DealsBoardColumnHeader } from '@/deals/boards/components/DealsBoardColumnHeader';
import type { DragEndEvent } from '@dnd-kit/core';
import { IDeal } from '@/deals/types/deals';
import { StagesLoading } from '@/deals/components/loading/StagesLoading';
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
  const setAllDealsMap = useSetAtom(allDealsMapState);

  const { changeDeals } = useDealsChange();
  const [pipelineId] = useQueryState<string>('pipelineId');

  const { stages, loading: stagesLoading } = useStages({
    variables: {
      pipelineId,
    },
    skip: !pipelineId,
  });

  const columns = stages?.map((stage) => ({
    id: stage._id,
    name: stage.name,
    type: stage.type,
    probability: stage.probability,
    itemsTotalCount: stage.itemsTotalCount,
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

    const overColumnId =
      overItem?.stageId ||
      columns.find((col) => col.id === over.id)?.id ||
      columns[0]?.id;

    setDeals((prev) => {
      let updated = [...prev];
      const activeIndex = updated.findIndex((d) => d.id === activeItem._id);
      if (activeItem.stageId !== overColumnId) {
        updated[activeIndex] = {
          ...updated[activeIndex],
          column: overColumnId,
          stageId: overColumnId,
        };
      } else {
        const columnItems = updated.filter((d) => d.column === overColumnId);

        const overIndex = columnItems.findIndex((d) => d.id === overItem?._id);

        const activeIndexInColumn = columnItems.findIndex(
          (d) => d.id === activeItem._id,
        );

        if (activeIndexInColumn > -1)
          columnItems.splice(activeIndexInColumn, 1);

        columnItems.splice(
          overIndex === -1 ? columnItems.length : overIndex,
          0,
          {
            ...activeItem,
            column: overColumnId,
            stageId: overColumnId,
            id: activeItem._id,
          },
        );

        updated = [
          ...updated.filter((d) => d.column !== overColumnId),
          ...columnItems,
        ];
      }

      setAllDealsMap((prev) => ({
        ...prev,
        [activeItem._id]: {
          ...activeItem,
          stageId: overColumnId,
          column: overColumnId,
        },
      }));

      const columnItemsAfter = updated.filter((d) => d.column === overColumnId);

      const activeNewIndex = columnItemsAfter.findIndex(
        (d) => d.id === activeItem._id,
      );
      const aboveItemId =
        activeNewIndex > 0
          ? columnItemsAfter[activeNewIndex - 1].id
          : undefined;

      changeDeals({
        variables: {
          itemId: activeItem._id,
          destinationStageId: overColumnId,
          sourceStageId: activeItem.stageId,
          aboveItemId,
        },
      });

      return updated;
    });

    setDealCountByBoard((prev) => ({
      ...prev,
      [activeItem?.stageId]: prev[activeItem?.stageId] - 1 || 0,
      [overColumnId]: (prev[overColumnId] || 0) + 1,
    }));
  };

  if (stagesLoading) {
    return <StagesLoading />;
  }

  return (
    <Board.Provider
      columns={columns}
      data={deals}
      onDragEnd={handleDragEnd}
      boardId={clsx('deals-board', pipelineId)}
      emptyUrl={'/settings/deals'}
    >
      {(column) => (
        <Board id={column.id} key={column.id} sortBy="updated" isSorted>
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

  const boardCards = dealCards.filter((deal) => deal.column === column.id);

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
      <DealsBoardColumnHeader
        column={column}
        loading={loading}
        totalCount={dealCountByBoard[column.id] || 0}
      />
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
              data={{ column: column.id }}
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
