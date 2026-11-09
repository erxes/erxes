import { useEffect, useRef } from 'react';

import { useMoveDealStage } from '@/deals/cards/hooks/useDeals';
import { useOptimisticField } from '@/deals/components/deal-selects/hooks/useOptimisticField';
import { useStages } from '@/deals/stage/hooks/useStages';
import { IDeal } from '@/deals/types/deals';

export type DealStageMoveTarget = Pick<
  IDeal,
  '_id' | 'stageId' | 'stage' | 'pipelineId' | 'pipeline'
>;

export const useDealStageMove = (deal: DealStageMoveTarget) => {
  const currentPipelineId =
    deal.stage?.pipelineId || deal.pipelineId || deal.pipeline?._id || '';
  const lastPipelineIdRef = useRef('');

  useEffect(() => {
    if (currentPipelineId) {
      lastPipelineIdRef.current = currentPipelineId;
    }
  }, [currentPipelineId]);

  const pipelineId = currentPipelineId || lastPipelineIdRef.current;
  const { moveDealStage } = useMoveDealStage();
  const { stages } = useStages({
    variables: { pipelineId },
    skip: !pipelineId,
  });
  const stage = useOptimisticField({
    value: deal.stageId || '',
    resetKey: deal._id,
    onCommit: (stageId, previousStageId) =>
      moveDealStage({
        deal: {
          ...deal,
          stageId: previousStageId,
        },
        stageId,
      }),
  });

  return { pipelineId, stages, stage };
};
