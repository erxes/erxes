import { SelectStageFormItem } from '@/pos/hooks/useSelectStage';
import { IconX } from '@tabler/icons-react';
import { Button, Label } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  PAPA_DEAL_STEPS,
  TPapaDealStep,
  TPapaStageIds,
} from '../utils/papaJson';

interface PapaDealStagesProps {
  pipelineId?: string;
  value: TPapaStageIds;
  onChange: (value: TPapaStageIds) => void;
}

/**
 * The deal stage each Papa delivery step moves the order's deal to, in the
 * delivery pipeline. A step left empty moves nothing.
 */
export const PapaDealStages = ({
  pipelineId,
  value,
  onChange,
}: PapaDealStagesProps) => {
  const { t } = useTranslation('sales');

  const labels: Record<TPapaDealStep, string> = {
    sent: t('papa-step-sent', 'Sent to Papa'),
    inTransit: t('papa-step-in-transit', 'On the way'),
    delivered: t('papa-step-delivered', 'Delivered'),
    cancelled: t('papa-step-cancelled', 'Cancelled by us'),
    failed: t('papa-step-failed', 'Failed (cancelled by Papa or expired)'),
  };

  if (!pipelineId) {
    return (
      <p className="text-sm text-muted-foreground">
        {t(
          'papa-stages-need-pipeline',
          'Choose the delivery pipeline in the delivery settings above to move deals with Papa statuses.',
        )}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {t(
          'papa-stages-hint',
          'The order’s delivery deal moves to these stages as Papa reports progress; a deal never moves back for the same Papa order.',
        )}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {PAPA_DEAL_STEPS.map((step) => (
          <div key={step} className="space-y-2">
            <Label>{labels[step]}</Label>
            <div className="flex gap-2">
              <div className="min-w-0 flex-1">
                <SelectStageFormItem
                  value={value[step]}
                  pipelineId={pipelineId}
                  onValueChange={(stageId) =>
                    onChange({ ...value, [step]: stageId })
                  }
                  placeholder={t('papa-stage-none', 'Do not move')}
                />
              </div>
              {value[step] && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={t('papa-stage-clear', 'Clear stage')}
                  onClick={() => onChange({ ...value, [step]: '' })}
                >
                  <IconX />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
