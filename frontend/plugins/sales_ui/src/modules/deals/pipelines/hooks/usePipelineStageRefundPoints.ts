import { useConfirm } from 'erxes-ui';
import { type Control, useController, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { TPipelineForm } from '@/deals/types/pipelines';

const LOST = 'Lost';

/**
 * A stage that gives loyalty points back when a deal enters it. Offered only
 * while the pipeline takes a payment in points; unset means a lost stage does
 * and any other does not.
 */
export const usePipelineStageRefundPoints = (
  control: Control<TPipelineForm>,
  index: number,
) => {
  const { t } = useTranslation('sales');
  const { confirm } = useConfirm();

  const [paymentTypes, probability] = useWatch({
    control,
    name: ['paymentTypes', `stages.${index}.probability`],
  });
  const { field } = useController({
    control,
    name: `stages.${index}.refundPoints`,
  });

  const visible = (paymentTypes || []).some(
    ({ scoreCampaignId }) => !!scoreCampaignId,
  );
  const checked = field.value ?? probability === LOST;

  const toggle = (next: boolean) => {
    confirm({
      message: t(
        next
          ? 'stage-refund-points-confirm-on'
          : 'stage-refund-points-confirm-off',
      ),
    }).then(() => field.onChange(next));
  };

  return { visible, checked, toggle };
};
