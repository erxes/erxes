import { TOutgoingWebhookForm } from '@/automations/components/builder/nodes/actions/webhooks/states/outgoingWebhookFormSchema';
import { AutomationNodeMetaInfoRow } from 'ui-modules';
import { NodeContentComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';

export const OutgoingWebhookNodeContent = ({
  config,
}: NodeContentComponentProps<TOutgoingWebhookForm>) => {
  const { url, method } = config || {};
  return (
    <>
      <AutomationNodeMetaInfoRow
        fieldName="URL"
        content={`${method}: ${url}`}
      />
    </>
  );
};
