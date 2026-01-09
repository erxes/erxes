import {
  isDraggingAtom,
  useAllDealsMap,
  useDealCountByColumn,
  useDealsBoard,
} from '@/deals/states/dealsBoardState';

import { useEffect, useMemo } from 'react';

import { BoardDealColumn } from '@/deals/types/boards';
import { DealsBoardColumnHeader } from './DealsBoardColumnHeader';
import { useAtomValue } from 'jotai';
import { useDeals } from '@/deals/cards/hooks/useDeals';
import { useSearchParams } from 'react-router-dom';

interface DealsBoardColumnProps {
  column: BoardDealColumn;
  count: number;
  pipelineId: string;
  queryVariables?: Record<string, unknown>;
}

export function DealsBoardColumn({
  column,
  count,
  pipelineId,
  queryVariables = {},
}: DealsBoardColumnProps) {
  const isDragging = useAtomValue(isDraggingAtom);
  const [, setBoardState] = useDealsBoard();
  const [, setAllDealsMap] = useAllDealsMap();
  const [, setDealCountByColumn] = useDealCountByColumn();
  const { deals, totalCount, loading } = useDeals({
    variables: {
      stageId: column._id,
      pipelineId,
      ...queryVariables,
    },
  });

  const [searchParams] = useSearchParams();
  const archivedOnly = searchParams.get('archivedOnly') === 'true';

  const filteredDeals = useMemo(() => {
    return (deals || []).filter((deal) => {
      return archivedOnly
        ? deal.status === 'archived'
        : deal.status !== 'archived';
    });
  }, [deals, archivedOnly]);

  useEffect(() => {
    if (isDragging) return;
    if (!filteredDeals || filteredDeals.length === 0) return;

    const dealItems: any[] = filteredDeals.map((deal) => ({
      id: deal._id,
      columnId: deal.stageId,
      ...deal,
    }));

    setBoardState((prev) => {
      if (!prev) return prev;

      const newItems = { ...prev.items };
      const newColumnItems = { ...prev.columnItems };

      const newIds: string[] = [];
      dealItems.forEach((item) => {
        newItems[item.id] = item;
        newIds.push(item.id);
      });

      const existingIds = newColumnItems[column._id] || [];
      const draggedHere = existingIds.filter(
        (id: string) =>
          newItems[id] &&
          !newIds.includes(id) &&
          newItems[id].columnId === column._id,
      );
      newColumnItems[column._id] = [...new Set([...draggedHere, ...newIds])];

      return { ...prev, items: newItems, columnItems: newColumnItems };
    });

    setAllDealsMap((prev) => {
      const newMap = { ...prev };
      dealItems.forEach((item) => {
        newMap[item._id] = item;
      });
      return newMap;
    });
  }, [filteredDeals, isDragging, column._id, setBoardState, setAllDealsMap]);

  useEffect(() => {
    if (totalCount !== undefined) {
      setDealCountByColumn((prev) => ({
        ...prev,
        [column._id]: filteredDeals.length,
      }));
    }
  }, [totalCount, column._id, setDealCountByColumn, filteredDeals.length]);

  return (
    <DealsBoardColumnHeader
      column={column}
      loading={loading}
      totalCount={count || 0}
    />
  );
}
