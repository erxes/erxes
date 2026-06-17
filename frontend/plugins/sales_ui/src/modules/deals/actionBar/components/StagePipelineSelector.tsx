import { memo, useEffect, useMemo, useRef } from 'react';
import { IconCheck } from '@tabler/icons-react';
import { Tooltip, cn } from 'erxes-ui';
import { StageSelect } from 'ui-modules';
import { IDeal } from '@/deals/types/deals';
import { IStage } from '@/deals/types/stages';
import { useMoveDealStage } from '@/deals/cards/hooks/useDeals';
import { useStages } from '@/deals/stage/hooks/useStages';

interface IStagePipelineSelectorProps {
  deal: IDeal;
}

const CIRCLE_HALF = 18;

export const StagePipelineSelector = memo(function StagePipelineSelector({
  deal,
}: IStagePipelineSelectorProps) {
  const currentPipelineId =
    deal.stage?.pipelineId || deal.pipelineId || deal.pipeline?._id || '';
  const lastPipelineIdRef = useRef('');
  const stagesByPipelineRef = useRef<Record<string, IStage[]>>({});
  const lastShortcutStagesRef = useRef<IStage[]>([]);

  useEffect(() => {
    if (currentPipelineId) {
      lastPipelineIdRef.current = currentPipelineId;
    }
  }, [currentPipelineId]);

  const pipelineId = currentPipelineId || lastPipelineIdRef.current;
  const { stages } = useStages({
    variables: { pipelineId },
    skip: !pipelineId,
  });
  const { moveDealStage } = useMoveDealStage();

  const shortcutStages = useMemo(() => {
    if (!pipelineId) {
      return [];
    }

    if (stages.length > 0) {
      stagesByPipelineRef.current[pipelineId] = stages;
      lastShortcutStagesRef.current = stages;
    }

    return (
      stagesByPipelineRef.current[pipelineId] || lastShortcutStagesRef.current
    );
  }, [pipelineId, stages]);

  const sorted = useMemo(
    () => [...shortcutStages].sort((a, b) => a.order - b.order),
    [shortcutStages],
  );
  const n = sorted.length;
  const currentIndex = sorted.findIndex((s) => s._id === deal.stageId);
  const progressRatio =
    n <= 1 || currentIndex <= 0 ? 0 : currentIndex / (n - 1);
  const hasShortcutStages = sorted.length > 0;

  return (
    <div className="flex items-center gap-3 w-full">
      <StageSelect
        stageId={deal.stageId}
        pipelineId={pipelineId}
        className="shrink-0 w-auto max-w-40 border border-input rounded-md"
        onChange={(stageId: string | string[]) => {
          const id = Array.isArray(stageId) ? stageId[0] : stageId;
          if (id) moveDealStage({ deal, stageId: id });
        }}
      />

      {hasShortcutStages && (
        <Tooltip.Provider delayDuration={150}>
          <div className="flex-1 relative">
            <div
              className="absolute top-1/2 -translate-y-1/2 h-0.5 bg-muted"
              style={{ left: CIRCLE_HALF, right: CIRCLE_HALF }}
            />
            {progressRatio > 0 && (
              <div
                className="absolute top-1/2 -translate-y-1/2 h-0.5 bg-primary transition-all duration-300"
                style={{
                  left: CIRCLE_HALF,
                  width: `calc((100% - ${CIRCLE_HALF * 2}px) * ${progressRatio})`,
                }}
              />
            )}
            <div className="relative flex justify-between">
              {sorted.map((stage, index) => {
                const isCurrent = index === currentIndex;
                const isFilled = index <= currentIndex;

                return (
                  <Tooltip key={stage._id}>
                    <Tooltip.Trigger asChild>
                      <button
                        onClick={() =>
                          moveDealStage({ deal, stageId: stage._id })
                        }
                        disabled={isCurrent}
                        aria-label={`Move to stage: ${stage.name}`}
                        className={cn(
                          'relative z-10 w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                          isFilled
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'bg-background border-border hover:border-primary/60 hover:scale-110 cursor-pointer',
                          isCurrent
                            ? 'cursor-default ring-2 ring-primary/20 ring-offset-1'
                            : 'cursor-pointer',
                        )}
                      >
                        {isFilled && <IconCheck size={15} strokeWidth={2.5} />}
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Content side="bottom" className="text-xs">
                      {stage.name}
                      {isCurrent && (
                        <span className="ml-1 opacity-60">(current)</span>
                      )}
                    </Tooltip.Content>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </Tooltip.Provider>
      )}
    </div>
  );
});
