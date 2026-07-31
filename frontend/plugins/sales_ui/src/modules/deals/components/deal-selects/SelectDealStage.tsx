import { memo, useEffect, useRef } from 'react';

import { DealStageChip } from '@/deals/components/deal-selects/DealDetailChips';
import { DealStageProgress } from '@/deals/components/deal-selects/DealStageProgress';
import { IDeal } from '@/deals/types/deals';
import { useMoveDealStage } from '@/deals/cards/hooks/useDeals';
import { useOptimisticField } from '@/deals/components/deal-selects/hooks/useOptimisticField';
import { useStages } from '@/deals/stage/hooks/useStages';

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

  return (
    <div className="flex items-center gap-3 w-full">
      <div className="shrink-0">
        <DealStageChip
          value={stage.value}
          pipelineId={pipelineId}
          onValueChange={(stageId) => {
            const id = Array.isArray(stageId) ? stageId[0] : stageId;
            if (id) {
              stage.setValue(id);
            }
          }}
        />
      </div>
      <DealStageProgress
        className="flex-1"
        stages={stages}
        stageId={stage.value}
        onSelect={stage.setValue}
      />
    </div>
  );
});
