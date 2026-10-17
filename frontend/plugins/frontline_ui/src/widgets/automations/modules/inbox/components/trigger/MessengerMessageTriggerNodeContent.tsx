import { useTranslation } from 'react-i18next';
import { AutomationNodeMetaInfoRow } from 'ui-modules';
import type { AutomationTriggerConfigProps } from 'ui-modules';
import { useIntegrationDetail } from '@/integrations/hooks/useIntegrationDetail';

const EVENT_LABEL_KEYS: Record<string, string> = {
  directMessage: 'event-direct-message',
  getStarted: 'event-get-started',
  quickReply: 'event-quick-reply',
  customerRegistration: 'event-customer-registration',
  ticketFormSubmission: 'event-ticket-form-submission',
  requestCreateTicket: 'event-request-create-ticket',
};

type TMessengerMessageCondition = {
  type: string;
  isSelected?: boolean;
};

type TMessengerMessageConfig = {
  integrationId?: string;
  conditions?: TMessengerMessageCondition[];
};

export const MessengerMessageTriggerNodeContent = ({
  config,
}: AutomationTriggerConfigProps<TMessengerMessageConfig>) => {
  const { t } = useTranslation('automations', {
    keyPrefix: 'messenger-message-trigger',
  });
  const { integrationDetail } = useIntegrationDetail({
    integrationId: config?.integrationId || null,
  });
  const conditions = config?.conditions || [];
  const selected = conditions.filter((c) => c.isSelected);

  const content = selected.length
    ? selected
        .map((c) =>
          EVENT_LABEL_KEYS[c.type] ? t(EVENT_LABEL_KEYS[c.type]) : c.type,
        ).join(', ')
    : t('no-events-selected');

  return (
    <>
      <AutomationNodeMetaInfoRow
        fieldName={t('node-messenger')}
        content={
          config?.integrationId
            ? integrationDetail?.name || config.integrationId
            : t('all-messengers')
        }
      />
      <AutomationNodeMetaInfoRow fieldName={t('node-events')} content={content} />
    </>
  );
};
