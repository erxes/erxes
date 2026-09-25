'use client';

import { useMemo } from 'react';
import { useQueryState } from 'erxes-ui';
import { useSearchParams } from 'react-router-dom';
import { useStages } from '@/deals/stage/hooks/useStages';
import type { BoardDealColumn } from '@/deals/types/boards';
import { getDealsQueryVariables } from '@/deals/utils/queryVariables';

export const useDealsBoardData = (): {
  columns: BoardDealColumn[];
  columnsLoading: boolean;
} => {
  const [pipelineId] = useQueryState<string>('pipelineId');
  const [searchParams] = useSearchParams();

  const queryVariables = useMemo(
    () =>
      getDealsQueryVariables(searchParams, {
        includeArchivedMode: false,
      }),
    [searchParams],
  );

  const { stages, loading } = useStages({
    variables: {
      pipelineId,
      ...queryVariables,
    },
    skip: !pipelineId,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const currentPipelineStages = useMemo(
    () => stages.filter((stage) => stage.pipelineId === pipelineId),
    [pipelineId, stages],
  );
  const hasStaleStages = stages.some(
    (stage) => stage.pipelineId !== pipelineId,
  );

  const columns = useMemo(
    () =>
      currentPipelineStages.map((stage) => ({
        _id: stage._id,
        name: stage.name,
        type: stage.type,
        probability: stage.probability,
        itemsTotalCount: stage.itemsTotalCount,
        amount: stage.amount || 0,
        unUsedAmount: stage.unUsedAmount || 0,
      })),
    [currentPipelineStages],
  );

  return { columns, columnsLoading: loading || hasStaleStages };
};
