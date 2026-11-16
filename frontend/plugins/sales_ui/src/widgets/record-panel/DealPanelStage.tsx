import { useDealStageMove } from '@/deals/components/deal-selects/hooks/useDealStageMove';
import { useDealDetail } from '@/deals/cards/hooks/useDeals';
import { IDealDetail } from '@/deals/types/deals';
import { IconProgress } from '@tabler/icons-react';
import { cn, Tooltip } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PanelField } from 'ui-modules';
import { DealPanelStageCell } from '~/widgets/record-panel/DealPanelCells';

export const DealPanelStage = ({ deal }: { deal: IDealDetail }) => {
  const { t } = useTranslation('sales');
  const { pipelineId, stage } = useDealStageMove(deal);

  return (
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
  );
};

export const DealStageProgress = ({ deal }: { deal: IDealDetail }) => {
  const { stages, stage } = useDealStageMove(deal);

  const sorted = useMemo(
    () => [...stages].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [stages],
  );
  const currentIndex = sorted.findIndex((item) => item._id === stage.value);

  if (sorted.length < 2) {
    return null;
  }

  return (
    <Tooltip.Provider delayDuration={150}>
      <div className="box-content flex h-9 min-w-0 flex-none items-center border-b px-5">
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
                  className="group -m-1.5 shrink-0 cursor-pointer rounded-full p-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default"
                >
                  <span
                    className={cn(
                      'block size-4 rounded-full border-2 transition-all',
                      index <= currentIndex
                        ? 'border-primary bg-primary'
                        : 'border-border bg-background group-hover:scale-110 group-hover:border-primary/60',
                      index === currentIndex && 'ring-4 ring-primary/20',
                    )}
                  />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Content side="bottom" className="text-xs">
                {item.name}
              </Tooltip.Content>
            </Tooltip>
            {index < sorted.length - 1 && (
              <span
                aria-hidden="true"
                className={cn(
                  'mx-1.5 h-0.5 min-w-1 flex-1 rounded-full',
                  index < currentIndex ? 'bg-primary' : 'bg-border',
                )}
              />
            )}
          </div>
        ))}
      </div>
    </Tooltip.Provider>
  );
};

export const DealPanelSummary = ({ dealId }: { dealId: string }) => {
  const { deal } = useDealDetail(
    { variables: { _id: dealId }, fetchPolicy: 'cache-first' },
    { subscribe: false },
  );

  return deal ? <DealStageProgress deal={deal} /> : null;
};
