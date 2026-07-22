'use client';

import { useMemo } from 'react';
import { useQueryState } from 'erxes-ui';
import { useStages } from '@/deals/stage/hooks/useStages';
import type { BoardDealColumn } from '@/deals/types/boards';

export const useDealsBoardData = (): {
  columns: BoardDealColumn[];
  columnsLoading: boolean;
} => {
  const [pipelineId] = useQueryState<string>('pipelineId');

  const { stages, loading } = useStages({
    variables: { pipelineId },
    skip: !pipelineId,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const columns = useMemo(
    () =>
      stages?.map((stage) => ({
        _id: stage._id,
        name: stage.name,
        type: stage.type,
        probability: stage.probability,
        itemsTotalCount: stage.itemsTotalCount,
        amount: stage.amount || 0,
        unUsedAmount: stage.unUsedAmount || 0,
      })) ?? [],
    [stages],
  );

  return { columns, columnsLoading: loading };
};
