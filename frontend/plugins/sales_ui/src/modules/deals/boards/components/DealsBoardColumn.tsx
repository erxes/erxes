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
  locallyMovedIdsRef,
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

    const dealItems: any[] = [...filteredDeals];

    setBoardState((prev) => {
      if (!prev) return prev;

      const newItems = { ...prev.items };
      const newColumnItems = { ...prev.columnItems };

      const newIds: string[] = [];

      const localMoves = (locallyMovedIdsRef?.current || {}) as Record<
        string,
        string
      >;

      dealItems.forEach((deal) => {
        const prevItem = prev.items[deal._id] || {};

        let columnId = localMoves[deal._id];

        if (!columnId) {
          columnId = deal.stageId || prevItem.columnId || column._id;
        }

        const mergedItem = {
          ...prevItem,
          ...deal,
          columnId,
        };

        newItems[deal._id] = {
          ...mergedItem,
          products: deal.products ?? prev.items[deal._id]?.products,
          productsData: deal.productsData ?? prev.items[deal._id]?.productsData,
          labels: deal.labels ?? prev.items[deal._id]?.labels,
          tags: deal.tags ?? prev.items[deal._id]?.tags,
          companies: deal.companies ?? prev.items[deal._id]?.companies,
          customers: deal.customers ?? prev.items[deal._id]?.customers,
          startDate: deal.startDate ?? prev.items[deal._id]?.startDate,
          closeDate: deal.closeDate ?? prev.items[deal._id]?.closeDate,
          departments: deal.departments ?? prev.items[deal._id]?.departments,
          customProperties:
            deal.customProperties ?? prev.items[deal._id]?.customProperties,
        };

        if (columnId === column._id) {
          newIds.push(deal._id);
        }
      });

      const hasLocalMoves = Object.keys(localMoves).length > 0;

      if (!hasLocalMoves) {
        newColumnItems[column._id] = newIds;
      } else {
        const existingIds = prev.columnItems[column._id] ?? [];

        const filteredExisting = existingIds.filter((id) => {
          const item = newItems[id] || prev.items[id];
          return item?.columnId === column._id;
        });

        const existingSet = new Set(filteredExisting);
        const addedItems = newIds.filter((id) => !existingSet.has(id));
        const mergedIds = [...filteredExisting, ...addedItems];

        newColumnItems[column._id] = mergedIds;
      }

      return { ...prev, items: newItems, columnItems: newColumnItems };
    });

    if (dealItems.length > 0) {
      setAllDealsMap((prev) => {
        const newMap = { ...prev };
        dealItems.forEach((item) => {
          newMap[item._id] = {
            ...prev[item._id],
            ...item,
            products: item.products ?? prev[item._id]?.products,
            productsData: item.productsData ?? prev[item._id]?.productsData,
            labels: item.labels ?? prev[item._id]?.labels,
            tags: item.tags ?? prev[item._id]?.tags,
            companies: item.companies ?? prev[item._id]?.companies,
            customers: item.customers ?? prev[item._id]?.customers,
            startDate: item.startDate ?? prev[item._id]?.startDate,
            closeDate: item.closeDate ?? prev[item._id]?.closeDate,
            departments: item.departments ?? prev[item._id]?.departments,
            customProperties:
              item.customProperties ?? prev[item._id]?.customProperties,
          };
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
    locallyMovedIdsRef,
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
