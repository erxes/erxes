import { useMemo } from 'react';
import { IconCheck } from '@tabler/icons-react';
import { Tooltip, cn } from 'erxes-ui';
import { IStage } from '@/deals/types/stages';

interface DealStageProgressProps {
  stages: IStage[];
  stageId: string;
  onSelect: (stageId: string) => void;
  className?: string;
}

export const DealStageProgress = ({
  stages,
  stageId,
  onSelect,
  className,
}: DealStageProgressProps) => {
  const sorted = useMemo(
    () => [...stages].sort((a, b) => a.order - b.order),
    [stages],
  );

  const currentIndex = sorted.findIndex((stage) => stage._id === stageId);

  if (!sorted.length) return null;

  return (
    <Tooltip.Provider delayDuration={150}>
      <div className={cn('flex flex-wrap items-center gap-2', className)}>
        {sorted.map((stage, index) => {
          const isCurrent = index === currentIndex;
          const isFilled = index <= currentIndex;

          return (
            <Tooltip key={stage._id}>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  onClick={() => onSelect(stage._id)}
                  disabled={isCurrent}
                  aria-label={`Move to stage: ${stage.name}`}
                  className={cn(
                    'relative z-10 w-9 h-9 shrink-0 rounded-full flex items-center justify-center border-2 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                    isFilled
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-background border-border hover:border-primary/60 hover:scale-110',
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
    </Tooltip.Provider>
  );
};
