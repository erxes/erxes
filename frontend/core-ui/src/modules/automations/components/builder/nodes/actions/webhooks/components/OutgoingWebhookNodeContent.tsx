import { TOutgoingWebhookForm } from '@/automations/components/builder/nodes/actions/webhooks/states/outgoingWebhookFormSchema';
import { MetaFieldLine } from '@/automations/components/builder/nodes/components/MetaFieldLine';
import { NodeContentComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';

export const OutgoingWebhookNodeContent = ({
  config,
}: NodeContentComponentProps<TOutgoingWebhookForm>) => {
  const { url, method } = config || {};
  return (
    <>
      <MetaFieldLine fieldName="URL" content={`${method}: ${url}`} />
    </>
  );
};
