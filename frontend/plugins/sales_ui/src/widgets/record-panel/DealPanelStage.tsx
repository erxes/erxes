import { useMoveDealStage } from '@/deals/cards/hooks/useDeals';
import { useOptimisticField } from '@/deals/components/deal-selects/hooks/useOptimisticField';
import { useStages } from '@/deals/stage/hooks/useStages';
import { IDealDetail } from '@/deals/types/deals';
import { IconProgress } from '@tabler/icons-react';
import { cn, Tooltip } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PanelField } from 'ui-modules';
import { DealPanelStageCell } from '~/widgets/record-panel/DealPanelCells';

export const DealPanelStage = ({ deal }: { deal: IDealDetail }) => {
  const { t } = useTranslation('sales');
  const { moveDealStage } = useMoveDealStage();
  const pipelineId =
    deal.stage?.pipelineId || deal.pipelineId || deal.pipeline?._id || '';
  const { stages } = useStages({
    variables: { pipelineId },
    skip: !pipelineId,
  });
  const stage = useOptimisticField({
    value: deal.stageId || '',
    resetKey: deal._id,
    onCommit: (stageId, previousStageId) =>
      moveDealStage({
        deal: { ...deal, stageId: previousStageId },
        stageId,
      }),
  });

  const sorted = useMemo(
    () => [...stages].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [stages],
  );
  const currentIndex = sorted.findIndex((item) => item._id === stage.value);

  return (
    <div className="flex flex-col gap-1">
      <PanelField icon={IconProgress} label={t('stage')}>
        <DealPanelStageCell
          value={stage.value}
          pipelineId={pipelineId}
          onValueChange={(value) => {
            const stageId = Array.isArray(value) ? value[0] : value;
            if (stageId) {
              stage.setValue(stageId);
            }
          }}
        />
      </PanelField>
      {sorted.length > 1 && (
        <Tooltip.Provider delayDuration={150}>
          <div className="flex items-center px-1 py-1">
            {sorted.map((item, index) => (
              <div
                key={item._id}
                className="flex min-w-0 flex-1 items-center last:flex-none"
              >
                <Tooltip>
                  <Tooltip.Trigger asChild>
                    <button
                      type="button"
                      aria-label={item.name}
                      disabled={index === currentIndex}
                      onClick={() => stage.setValue(item._id)}
                      className={cn(
                        'size-2.5 shrink-0 rounded-full border transition-colors',
                        index <= currentIndex
                          ? 'border-primary bg-primary'
                          : 'border-border bg-background hover:border-primary/60',
                        index === currentIndex &&
                          'ring-2 ring-primary/25 ring-offset-1 ring-offset-background',
                      )}
                    />
                  </Tooltip.Trigger>
                  <Tooltip.Content side="bottom" className="text-xs">
                    {item.name}
                  </Tooltip.Content>
                </Tooltip>
                {index < sorted.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      'h-px min-w-1 flex-1',
                      index < currentIndex ? 'bg-primary' : 'bg-border',
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </Tooltip.Provider>
      )}
    </div>
  );
};
