'use client';

import { useMemo } from 'react';
import { useQueryState } from 'erxes-ui';
import { useStages } from '@/deals/stage/hooks/useStages';

export const useDealsBoardData = (): {
  columns: any[];
  columnsLoading: boolean;
} => {
  const [pipelineId] = useQueryState<string>('pipelineId');

  const { stages, loading } = useStages({
    variables: { pipelineId },
    skip: !pipelineId,
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
