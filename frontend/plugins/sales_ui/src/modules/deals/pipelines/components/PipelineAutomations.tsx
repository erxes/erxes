import { useTranslation } from 'react-i18next';
import { SourceAutomations } from '@/automations/components/SourceAutomations';
import { TSourceTrigger } from '@/automations/hooks/useSourceAutomations';
import { DEAL_WON_TRIGGER_TYPE } from '@/deals/pipelines/hooks/usePipelinePurchaseContext';

// Registered types name the collection (`deals`); older automations were saved
// under the singular form and still show up here.
const DEAL_STAGE_CHANGED_TRIGGER_TYPE = 'sales:sales.deals.stageChanged';
const DEAL_TRIGGER_TYPES = [
  'sales:sales.deals',
  DEAL_WON_TRIGGER_TYPE,
  DEAL_STAGE_CHANGED_TRIGGER_TYPE,
  'sales:sales.deal',
  'sales:sales.deal.probability',
  'sales:sales.deal.stageChanged',
];

/** What this pipeline's deals set off, and where new rules for them start. */
export const PipelineAutomations = ({
  pipelineId,
  pipelineName,
}: {
  pipelineId: string;
  pipelineName: string;
}) => {
  const { t } = useTranslation('sales');
  const label = pipelineName || t('pipeline', 'Pipeline');

  // A trigger naming no pipeline runs on every pipeline, this one included.
  const scopeOf = ({ config }: TSourceTrigger) =>
    !config?.pipelineId
      ? 'all'
      : config.pipelineId === pipelineId
      ? 'own'
      : null;

  const describe = ({ type, config }: TSourceTrigger) =>
    type.endsWith('.probability')
      ? String(config?.probability || '')
      : type.endsWith('.stageChanged')
      ? t('pipeline-automation-stage-changed', 'Stage changed')
      : '';

  return (
    <SourceAutomations
      label={label}
      triggerTypes={DEAL_TRIGGER_TYPES}
      scopeOf={scopeOf}
      describe={describe}
      newTrigger={{
        type: DEAL_STAGE_CHANGED_TRIGGER_TYPE,
        config: { pipelineId },
      }}
      hint={t(
        'pipeline-automations-hint',
        'Rules that run on this pipeline’s deals: points, vouchers, messages. Each one is a regular automation you can edit in the builder.',
      )}
      empty={t(
        'pipeline-automations-empty',
        'No automation runs on this pipeline’s deals yet.',
      )}
      allLabel={t('pipeline-automation-all', 'All pipelines')}
    />
  );
};
