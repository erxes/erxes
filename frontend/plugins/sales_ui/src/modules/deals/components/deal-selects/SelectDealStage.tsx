import { memo } from 'react';

import { DealStageChip } from '@/deals/components/deal-selects/DealDetailChips';
import { DealStageProgress } from '@/deals/components/deal-selects/DealStageProgress';
import {
  DealStageMoveTarget,
  useDealStageMove,
} from '@/deals/components/deal-selects/hooks/useDealStageMove';

export const SelectDealStage = memo(function SelectDealStage({
  deal,
}: {
  deal: DealStageMoveTarget;
}) {
  const { pipelineId, stages, stage } = useDealStageMove(deal);

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
        className="min-w-0 flex-1"
        stages={stages}
        stageId={stage.value}
        onSelect={stage.setValue}
      />
    </div>
  );
});
