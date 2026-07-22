import { memo, useEffect, useRef } from 'react';

import { DealStageChip } from '@/deals/components/deal-selects/DealDetailChips';
import { IDeal } from '@/deals/types/deals';
import { useMoveDealStage } from '@/deals/cards/hooks/useDeals';

export const SelectDealStage = memo(function SelectDealStage({
  deal,
}: {
  deal: IDeal;
}) {
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

  return (
    <DealStageChip
      value={deal.stageId || ''}
      pipelineId={pipelineId}
      onValueChange={(stageId) => {
        const id = Array.isArray(stageId) ? stageId[0] : stageId;
        if (id && id !== deal.stageId) moveDealStage({ deal, stageId: id });
      }}
    />
  );
});
