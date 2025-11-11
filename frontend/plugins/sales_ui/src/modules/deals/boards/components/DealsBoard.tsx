import {
  Board,
  BoardColumnProps,
  EnumCursorDirection,
  Skeleton,
  SkeletonArray,
  useQueryState,
} from 'erxes-ui';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useSearchParams } from 'react-router';
import type { DragEndEvent } from '@dnd-kit/core';
import clsx from 'clsx';

import { useDeals, useDealsChange } from '@/deals/cards/hooks/useDeals';
import { DealsBoardCard } from '@/deals/boards/components/DealsBoardCard';
import { DealsBoardColumnHeader } from '@/deals/boards/components/DealsBoardColumnHeader';
import { StagesLoading } from '@/deals/components/loading/StagesLoading';
import { useStages } from '@/deals/stage/hooks/useStages';
import { dealCountByBoardAtom } from '@/deals/states/dealsTotalCountState';
import type { IDeal } from '@/deals/types/deals';

// State management
interface BoardItem extends Record<string, unknown> {
  id: string;
  column: string;
  stageId: string;
  name: string;
}

const fetchedDealsState = atom<BoardItem[]>([]);
export const allDealsMapState = atom<Record<string, IDeal>>({});

// Utility functions
const buildQueryVariables = (searchParams: URLSearchParams) => {
  const ignoredKeys = [
    'boardId',
    'pipelineId',
    'salesItemId',
    'tab',
    'archivedOnly',
    'noSkipArchive',
  ];
  const variables: Record<string, any> = {};

  for (const [key, value] of searchParams.entries()) {
    if (ignoredKeys.includes(key)) continue;

    try {
      variables[key] = JSON.parse(value);
    } catch {
      variables[key] = value;
    }
  }

  return variables;
};

// Main component
export const DealsBoard = () => {
  const [pipelineId] = useQueryState<string>('pipelineId');
  const [searchParams] = useSearchParams();
  const [deals, setDeals] = useAtom(fetchedDealsState);
  const allDealsMap = useAtomValue(allDealsMapState);
  const setAllDealsMap = useSetAtom(allDealsMapState);
  const setDealCountByBoard = useSetAtom(dealCountByBoardAtom);
  const { changeDeals } = useDealsChange();

  const { stages, loading: stagesLoading } = useStages({
    variables: { pipelineId },
    skip: !pipelineId,
  });

  const columns =
    stages?.map((stage) => ({
      id: stage._id,
      name: stage.name,
      type: stage.type,
      probability: stage.probability,
      itemsTotalCount: stage.itemsTotalCount,
    })) || [];

  // Reset deal counts when pipeline or search params change
  const searchParamsString = searchParams.toString();
  useEffect(() => {
    setDealCountByBoard({});
  }, [pipelineId, searchParamsString, setDealCountByBoard]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeItem = allDealsMap[active.id as string];
    if (!activeItem) return;

    const overItem = allDealsMap[over.id as string];
    const overColumnId =
      overItem?.stageId ||
      columns.find((col) => col.id === over.id)?.id ||
      columns[0]?.id;

    if (!overColumnId) return;

    const previousStageId = activeItem.stageId;
    const isSameColumn = previousStageId === overColumnId;

    setDeals((prev) => {
      let updated = [...prev];
      const activeIndex = updated.findIndex((d) => d.id === activeItem._id);

      if (!isSameColumn) {
        // Move to different column
        updated[activeIndex] = {
          ...updated[activeIndex],
          column: overColumnId,
          stageId: overColumnId,
        };
      } else {
        // Reorder within same column
        const columnItems = updated.filter((d) => d.column === overColumnId);
        const activeIndexInColumn = columnItems.findIndex(
          (d) => d.id === activeItem._id,
        );
        const overIndex = columnItems.findIndex((d) => d.id === overItem?._id);

        if (activeIndexInColumn > -1) {
          columnItems.splice(activeIndexInColumn, 1);
        }

        const insertIndex = overIndex === -1 ? columnItems.length : overIndex;
        columnItems.splice(insertIndex, 0, {
          ...activeItem,
          column: overColumnId,
          stageId: overColumnId,
          id: activeItem._id,
        });

        updated = [
          ...updated.filter((d) => d.column !== overColumnId),
          ...columnItems,
        ];
      }

      // Update deal map
      setAllDealsMap((prev) => ({
        ...prev,
        [activeItem._id]: {
          ...activeItem,
          stageId: overColumnId,
        },
      }));

      // Calculate position for API call
      const columnItemsAfter = updated.filter((d) => d.column === overColumnId);
      const activeNewIndex = columnItemsAfter.findIndex(
        (d) => d.id === activeItem._id,
      );
      const aboveItemId =
        activeNewIndex > 0
          ? columnItemsAfter[activeNewIndex - 1].id
          : undefined;

      // Update backend
      changeDeals({
        variables: {
          itemId: activeItem._id,
          destinationStageId: overColumnId,
          sourceStageId: previousStageId,
          aboveItemId,
        },
      });

      return updated;
    });

    // Update counts if moved to different column
    if (!isSameColumn) {
      setDealCountByBoard((prev) => ({
        ...prev,
        [previousStageId]: Math.max((prev[previousStageId] || 1) - 1, 0),
        [overColumnId]: (prev[overColumnId] || 0) + 1,
      }));
    }
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
      emptyUrl="/settings/deals"
    >
      {(column) => (
        <Board id={column.id} key={column.id} sortBy="updated" isSorted>
          <DealsBoardCards column={column} />
        </Board>
      )}
    </Board.Provider>
  );
};

// Column cards component
export const DealsBoardCards = ({ column }: { column: BoardColumnProps }) => {
  const [pipelineId] = useQueryState('pipelineId');
  const [searchParams] = useSearchParams();
  const [dealCards, setDealCards] = useAtom(fetchedDealsState);
  const [dealCountByBoard, setDealCountByBoard] = useAtom(dealCountByBoardAtom);
  const setAllDealsMap = useSetAtom(allDealsMapState);

  const archivedOnly = searchParams.get('archivedOnly') === 'true';
  const queryVariables = buildQueryVariables(searchParams);

  const { deals, totalCount, loading, handleFetchMore } = useDeals({
    variables: {
      stageId: column.id,
      pipelineId,
      ...queryVariables,
      ...(archivedOnly && { noSkipArchive: true }),
    },
  });

  const boardCards = dealCards.filter((deal) => deal.column === column.id);

  // Update deals when data changes
  useEffect(() => {
    const filteredDeals = archivedOnly
      ? deals?.filter((d) => d.status === 'archived') || []
      : deals?.filter((d) => d.status !== 'archived') || [];

    if (filteredDeals.length > 0) {
      setDealCards((prev) => {
        const withoutThisColumn = prev.filter((d) => d.column !== column.id);
        const newCards = filteredDeals.map((deal) => ({
          id: deal._id,
          column: deal.stageId,
          stageId: deal.stageId,
          name: deal.name,
        }));
        return [...withoutThisColumn, ...newCards];
      });

      setAllDealsMap((prev) => {
        const newDealsMap = filteredDeals.reduce((acc, deal) => {
          acc[deal._id] = deal;
          return acc;
        }, {} as Record<string, IDeal>);
        return { ...prev, ...newDealsMap };
      });
    } else {
      setDealCards((prev) => prev.filter((d) => d.column !== column.id));
    }
  }, [deals, archivedOnly, column.id, setDealCards, setAllDealsMap]);

  // Update total count
  useEffect(() => {
    if (totalCount !== undefined) {
      setDealCountByBoard((prev) => ({
        ...prev,
        [column.id]: totalCount,
      }));
    }
  }, [totalCount, column.id, setDealCountByBoard]);

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
          onFetchMore={() =>
            handleFetchMore({ direction: EnumCursorDirection.FORWARD })
          }
        />
      </Board.Cards>
    </>
  );
};

// Infinite scroll component
export const DealCardsFetchMore = ({
  totalCount,
  currentLength,
  onFetchMore,
}: {
  totalCount: number;
  currentLength: number;
  onFetchMore: () => void;
}) => {
  const { ref: bottomRef } = useInView({
    onChange: (inView) => inView && onFetchMore(),
  });

  const shouldShowMore =
    totalCount > 0 && currentLength < totalCount && currentLength > 0;

  if (!shouldShowMore) {
    return null;
  }

  return (
    <div ref={bottomRef}>
      <Skeleton className="p-12 w-full rounded shadow-xs opacity-80" />
    </div>
  );
};
