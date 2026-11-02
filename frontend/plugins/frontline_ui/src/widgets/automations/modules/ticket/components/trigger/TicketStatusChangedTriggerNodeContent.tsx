import { useTranslation } from 'react-i18next';
import { AutomationNodeMetaInfoRow } from 'ui-modules';
import type { AutomationTriggerConfigProps } from 'ui-modules';
import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
import { readTicketStatusChangedTriggerConfig } from '../../states/ticketStatusChangedTriggerForm';

export const TicketStatusChangedTriggerNodeContent = ({
  config,
}: AutomationTriggerConfigProps<unknown>) => {
  const { t } = useTranslation('frontline');
  const { pipelineId, toStatusIds } =
    readTicketStatusChangedTriggerConfig(config);
  const { pipeline } = useGetPipeline(pipelineId || undefined);

  return (
    <>
      <AutomationNodeMetaInfoRow
        fieldName={t('pipeline-label', 'Pipeline')}
        content={
          pipelineId
            ? pipeline?.name || pipelineId
            : t('no-pipeline-selected', 'No pipeline selected')
        }
      />
      <AutomationNodeMetaInfoRow
        fieldName={t('status', 'Status')}
        content={
          toStatusIds.length
            ? String(toStatusIds.length)
            : t('status-checklist-all', 'All statuses')
        }
      />
    </>
  );
};
