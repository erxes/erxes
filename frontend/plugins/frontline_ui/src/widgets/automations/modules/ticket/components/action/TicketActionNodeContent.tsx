import {
  AutomationActionNodeConfigProps,
  AutomationNodeMetaInfoRow,
} from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { TTicketActionConfigForm } from '../../states/ticketActionConfigFormDefinitions';

const LABELS: Partial<Record<keyof TTicketActionConfigForm, string>> = {
  channelId: 'channel-label',
  pipelineId: 'pipeline-label',
  statusId: 'status',
  name: 'name',
  description: 'description',
  priority: 'priority-label',
  assigneeId: 'assignee',
  startDate: 'start-date',
  targetDate: 'target-date',
  labelIds: 'labels',
  tagIds: 'tags',
  companyIds: 'companies',
};

export const TicketActionNodeContent = ({
  config,
}: AutomationActionNodeConfigProps<TTicketActionConfigForm>) => {
  const { t } = useTranslation('frontline');
  return (
    <div>
      {Object.entries(config || {})
        .filter(([key, value]) =>
          Boolean(LABELS[key as keyof TTicketActionConfigForm] && value),
        )
        .map(([key, value]) => (
          <AutomationNodeMetaInfoRow
            key={key}
            fieldName={t(LABELS[key as keyof TTicketActionConfigForm] || key)}
            content={String(value)}
          />
        ))}
    </div>
  );
};
