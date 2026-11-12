import { useTranslation } from 'react-i18next';
import { AutomationNodeMetaInfoRow } from 'ui-modules';
import type { AutomationTriggerConfigProps } from 'ui-modules';
import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
import { readTicketSlaTriggerConfig } from '../../states/ticketSlaTriggerForm';

export const TicketSlaTriggerNodeContent = ({
  config,
}: AutomationTriggerConfigProps<unknown>) => {
  const { t } = useTranslation('frontline');
  const { pipelineId, events } = readTicketSlaTriggerConfig(config);
  const { pipeline } = useGetPipeline(pipelineId || undefined);

  return (
    <>
      <AutomationNodeMetaInfoRow
        fieldName={t('pipeline-label', 'Pipeline')}
        content={
          pipelineId
            ? pipeline?.name || pipelineId
            : t('all-pipelines', 'All pipelines')
        }
      />
      <AutomationNodeMetaInfoRow
        fieldName={t('ticket-sla-trigger-events', 'Run when')}
        content={
          events.length
            ? String(events.length)
            : t('ticket-sla-all-events', 'Every warning and miss')
        }
      />
    </>
  );
};
