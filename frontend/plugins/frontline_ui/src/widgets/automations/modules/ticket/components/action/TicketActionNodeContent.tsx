import {
  AutomationActionNodeConfigProps,
  AutomationNodeMetaInfoRow,
} from 'ui-modules';
import { TTicketActionConfigForm } from '../../states/ticketActionConfigFormDefinitions';

const LABELS: Partial<Record<keyof TTicketActionConfigForm, string>> = {
  channelId: 'Channel',
  pipelineId: 'Pipeline',
  statusId: 'Status',
  name: 'Name',
  description: 'Description',
  priority: 'Priority',
  assigneeId: 'Assignee',
  startDate: 'Start date',
  targetDate: 'Target date',
  labelIds: 'Labels',
  tagIds: 'Tags',
  companyIds: 'Companies',
};

export const TicketActionNodeContent = ({
  config,
}: AutomationActionNodeConfigProps<TTicketActionConfigForm>) => {
  return (
    <div>
      {Object.entries(config || {})
        .filter(([key, value]) =>
          Boolean(LABELS[key as keyof TTicketActionConfigForm] && value),
        )
        .map(([key, value]) => (
          <AutomationNodeMetaInfoRow
            key={key}
            fieldName={LABELS[key as keyof TTicketActionConfigForm] || key}
            content={String(value)}
          />
        ))}
    </div>
  );
};
