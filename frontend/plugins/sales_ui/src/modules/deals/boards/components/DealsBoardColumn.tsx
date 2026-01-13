import {
  isDraggingAtom,
  useAllDealsMap,
  useColumnLoading,
  useDealCountByColumn,
  useDealsBoard,
} from '@/deals/states/dealsBoardState';
import { useEffect, useMemo, useRef } from 'react';

import { DealsBoardColumnHeader } from './DealsBoardColumnHeader';
import { DealsBoardColumnProps } from '@/deals/types/boards';
import { EnumCursorDirection } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useDeals } from '@/deals/cards/hooks/useDeals';
import { useSearchParams } from 'react-router-dom';

export function DealsBoardColumn({
  column,
  count,
  pipelineId,
  queryVariables = {},
  fetchMoreTrigger,
  onFetchComplete,
}: DealsBoardColumnProps) {
  const isDragging = useAtomValue(isDraggingAtom);
  const [, setBoardState] = useDealsBoard();
  const [, setAllDealsMap] = useAllDealsMap();
  const [, setDealCountByColumn] = useDealCountByColumn();
  const [, setColumnLoading] = useColumnLoading();

  const prevTriggerRef = useRef(fetchMoreTrigger);
  const prevDealsCountRef = useRef(0);
  const isFetchingRef = useRef(false);
  const initialLoadRef = useRef(true);

  const queryVariablesKey = useMemo(
    () => JSON.stringify(queryVariables),
    [queryVariables],
  );
  const prevQueryVariablesKeyRef = useRef(queryVariablesKey);

  useEffect(() => {
    if (queryVariablesKey !== prevQueryVariablesKeyRef.current) {
      prevQueryVariablesKeyRef.current = queryVariablesKey;
      prevDealsCountRef.current = 0;
      prevTriggerRef.current = 0;
      isFetchingRef.current = false;
      initialLoadRef.current = true;
    }
  }, [queryVariablesKey]);

  const { deals, totalCount, loading, pageInfo, handleFetchMore } = useDeals({
    variables: {
      stageId: column._id,
      pipelineId,
      ...queryVariables,
    },
  });

  useEffect(() => {
    setColumnLoading((prev) => ({ ...prev, [column._id]: loading }));
  }, [loading, column._id, setColumnLoading]);

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
    if (loading) return;

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

    if (dealItems.length > 0) {
      setAllDealsMap((prev) => {
        const newMap = { ...prev };
        dealItems.forEach((item) => {
          newMap[item._id] = item;
        });
        return newMap;
      });
    }

    if (
      initialLoadRef.current ||
      (isFetchingRef.current && dealItems.length !== prevDealsCountRef.current)
    ) {
      onFetchComplete?.(column._id, {
        fetchedCount: dealItems.length,
        hasMore: pageInfo?.hasNextPage ?? false,
        cursor: pageInfo?.endCursor,
        totalCount,
      });
      initialLoadRef.current = false;
      isFetchingRef.current = false;
    }

    prevDealsCountRef.current = dealItems.length;
  }, [
    filteredDeals,
    isDragging,
    column._id,
    setBoardState,
    setAllDealsMap,
    onFetchComplete,
    pageInfo,
    totalCount,
    loading,
  ]);

  useEffect(() => {
    setDealCountByColumn((prev) => ({
      ...prev,
      [column._id]: filteredDeals.length,
    }));
  }, [filteredDeals.length, column._id, setDealCountByColumn]);

  useEffect(() => {
    if (fetchMoreTrigger && fetchMoreTrigger > (prevTriggerRef.current || 0)) {
      prevTriggerRef.current = fetchMoreTrigger;

      // Check if there's more to fetch
      if (!pageInfo?.hasNextPage) {
        onFetchComplete?.(column._id, {
          fetchedCount: 0,
          hasMore: false,
          totalCount,
        });
        return;
      }

      isFetchingRef.current = true;
      handleFetchMore({ direction: EnumCursorDirection.FORWARD });
    }
  }, [
    fetchMoreTrigger,
    handleFetchMore,
    pageInfo,
    column._id,
    onFetchComplete,
    totalCount,
  ]);

  return (
    <DealsBoardColumnHeader
      column={column}
      loading={loading}
      totalCount={count || 0}
    />
  );
}
