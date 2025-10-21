import { TAutomationActionConfigFieldPrefix } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { Button, Form } from 'erxes-ui';
import { useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { IncomingWebhookConfigForm } from '@/automations/components/builder/nodes/triggers/webhooks/components/IncomingWebhookConfigForm';
import { TAutomationWaitEventConfig } from '@/automations/components/builder/nodes/actions/waitEvent/type/waitEvent';
import { NodeData } from '@/automations/types';
import { TriggerContentWrapper } from '@/automations/components/builder/sidebar/components/content/trigger/wrapper/TriggerContentWrapper';

export function WaitEventConfigCustomForm({
  configFieldNamePrefix,
  handleSave,
}: {
  configFieldNamePrefix: TAutomationActionConfigFieldPrefix;
  handleSave: (config: TAutomationWaitEventConfig) => void;
}) {
  const { control } = useFormContext<TAutomationBuilderForm>();
  const formRef = useRef<{ submit: () => void }>(null);

  return (
    <TriggerContentWrapper
      className="flex flex-col flex-1 overflow-auto"
      footer={
        <Button onClick={() => formRef.current?.submit()}>
          Save Configuration
        </Button>
      }
    >
      <Form.Field
        name={`${configFieldNamePrefix}.webhookConfig`}
        control={control}
        render={({ field }) => (
          <Form.Item className="flex-1 overflow-auto">
            <Form.Label>Conditions</Form.Label>
            <IncomingWebhookConfigForm
              formRef={formRef}
              activeNode={{ config: field.value } as NodeData}
              handleSave={(config: TAutomationWaitEventConfig) => {
                const prevConfig = field.value || {};
                handleSave({ ...prevConfig, webhookConfig: config });
              }}
            />
          </Form.Item>
        )}
      />
    </TriggerContentWrapper>
  );
}
