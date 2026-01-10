'use client';

import {
  DealsBoardState,
  useAllDealsMap,
  useDealsBoard,
} from '@/deals/states/dealsBoardState';
import { useCallback, useEffect, useMemo } from 'react';

import { DealsBoardCard } from './DealsBoardCard';
import { DealsBoardColumn } from './DealsBoardColumn';
import { GenericBoard } from './common/GenericBoard';
import { StagesLoading } from '@/deals/components/loading/StagesLoading';
import { useDealsBoardData } from '@/deals/boards/hooks/useDealsBoardData';
import { useDealsChange } from '@/deals/cards/hooks/useDeals';
import { useQueryState } from 'erxes-ui';
import { useSearchParams } from 'react-router-dom';
import { useStagesOrder } from '@/deals/stage/hooks/useStages';

export const DealsBoard = () => {
  const [boardState, setBoardState] = useDealsBoard();
  const [, setAllDealsMap] = useAllDealsMap();
  const { columns, columnsLoading } = useDealsBoardData();
  const [pipelineId] = useQueryState<string>('pipelineId');
  const { changeDeals } = useDealsChange();
  const { updateStagesOrder } = useStagesOrder();
  const [searchParams] = useSearchParams();

  const queryVariables = useMemo(() => {
    const ignoredKeys = ['boardId', 'pipelineId', 'salesItemId', 'tab'];
    const vars: Record<string, any> = {};

    for (const [key, value] of searchParams.entries()) {
      if (ignoredKeys.includes(key)) continue;

      try {
        const parsed = JSON.parse(value);
        vars[key] = parsed;
      } catch {
        vars[key] = value;
      }
    }

    if (searchParams.get('archivedOnly') === 'true') {
      vars.noSkipArchive = true;
    }

    return vars;
  }, [searchParams]);

  const archivedOnly = searchParams.get('archivedOnly') === 'true';

  useEffect(() => {
    setBoardState(null);
  }, [archivedOnly, setBoardState]);

  useEffect(() => {
    if (columns.length > 0 && !boardState) {
      const initialState: DealsBoardState = {
        columns,
        items: {},
        columnItems: Object.fromEntries(columns.map((col) => [col.id, []])),
      };
      setBoardState(initialState);
    }
  }, [columns, setBoardState, boardState]);

  useEffect(() => {
    setBoardState((prev) => {
      if (!prev || columns.length === 0) return prev;
      return { ...prev, columns };
    });
  }, [columns, setBoardState]);

  const handleStateChange = useCallback(
    (
      newState: DealsBoardState,
      oldState: DealsBoardState,
      draggedItemId?: string,
    ) => {
      setBoardState(newState);

      Object.values(newState.items).forEach((item) => {
        setAllDealsMap((prev) => ({
          ...prev,
          [item._id]: item,
        }));
      });

      // Detect column reorder
      const oldColumnOrder = oldState?.columns.map((c) => c._id).join(',');
      const newColumnOrder = newState.columns.map((c) => c._id).join(',');
      if (oldColumnOrder && oldColumnOrder !== newColumnOrder) {
        updateStagesOrder({
          variables: {
            orders: newState.columns.map((stage, index) => ({
              _id: stage._id,
              order: index,
            })),
          },
        });
        return;
      }

      if (!draggedItemId) return;

      const newItem = newState.items[draggedItemId];
      const oldItem = oldState?.items[draggedItemId];
      if (!newItem || !oldItem) return;

      const newColumnItems = newState.columnItems[newItem.columnId || ''] || [];
      const oldColumnItems =
        oldState?.columnItems[oldItem.columnId || ''] || [];
      const newIndex = newColumnItems.indexOf(draggedItemId);
      const oldIndex = oldColumnItems.indexOf(draggedItemId);

      const columnChanged = newItem.columnId !== oldItem.columnId;
      const orderChanged = !columnChanged && newIndex !== oldIndex;

      if (columnChanged || orderChanged) {
        const aboveItemId =
          newIndex > 0 ? newColumnItems[newIndex - 1] : undefined;

        changeDeals({
          variables: {
            itemId: draggedItemId,
            destinationStageId: newItem.columnId,
            sourceStageId: oldItem.columnId,
            aboveItemId,
          },
        });
      }
    },
    [setBoardState, setAllDealsMap],
  );

  if (!boardState || columnsLoading) {
    return <StagesLoading />;
  }
  return (
    <GenericBoard<any, any>
      initialState={boardState}
      onStateChange={handleStateChange}
      renderCard={(deal) => <DealsBoardCard deal={deal} />}
      renderColumnHeader={(column, count) => (
        <DealsBoardColumn
          column={column}
          count={count}
          pipelineId={pipelineId || ''}
          queryVariables={queryVariables}
        />
      )}
    />
  );
};
