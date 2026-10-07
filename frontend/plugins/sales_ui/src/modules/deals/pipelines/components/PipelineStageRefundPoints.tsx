import { Checkbox, Label } from 'erxes-ui';
import { type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { usePipelineStageRefundPoints } from '@/deals/pipelines/hooks/usePipelineStageRefundPoints';
import type { TPipelineForm } from '@/deals/types/pipelines';

export const PipelineStageRefundPoints = ({
  control,
  index,
}: {
  control: Control<TPipelineForm>;
  index: number;
}) => {
  const { t } = useTranslation('sales');
  const { visible, checked, toggle } = usePipelineStageRefundPoints(
    control,
    index,
  );

  if (!visible) {
    return null;
  }

  return (
    <div className="flex items-start gap-2 mt-3">
      <Checkbox
        id={`refundPoints-${index}`}
        checked={checked}
        onCheckedChange={(value) => toggle(value === true)}
        className="mt-0.5"
      />
      <div className="flex flex-col gap-0.5">
        <Label htmlFor={`refundPoints-${index}`}>
          {t('stage-refund-points')}
        </Label>
        <span className="text-xs text-muted-foreground whitespace-normal">
          {t('stage-refund-points-hint')}
        </span>
      </div>
    </div>
  );
};
