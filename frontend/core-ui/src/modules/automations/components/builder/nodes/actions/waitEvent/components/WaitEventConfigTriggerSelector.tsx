import { useWaitEventConfigTriggerSelector } from '@/automations/components/builder/nodes/actions/waitEvent/hooks/useWaitEventConfigTriggerSelector';
import {
  TAutomationWaitEventConfig,
  WaitEventTargetTypes,
} from '@/automations/components/builder/nodes/actions/waitEvent/type/waitEvent';
import { TAutomationActionConfigFieldPrefix } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { Form, IconComponent, Select } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';

export function WaitEventConfigTriggerSelector({
  targetType,
  actionId,
  configFieldNamePrefix,
}: {
  targetType: TAutomationWaitEventConfig['targetType'];
  actionId: string;
  configFieldNamePrefix: TAutomationActionConfigFieldPrefix;
}) {
  const { nonCustomTriggers } = useWaitEventConfigTriggerSelector(actionId);
  const { control } = useFormContext<TAutomationBuilderForm>();

  if (
    targetType !== WaitEventTargetTypes.Trigger ||
    (nonCustomTriggers?.length ?? 0) < 2
  ) {
    return null;
  }

  return (
    <Form.Field
      name={`${configFieldNamePrefix}.targetTriggerId`}
      control={control}
      render={({ field }) => (
        <Form.Item className="px-4">
          <Form.Label>Select trigger</Form.Label>
          <Select value={field.value} onValueChange={field.onChange}>
            <Select.Trigger
              id={`target-trigger-${actionId}`}
              aria-describedby={`target-trigger-help-${actionId}`}
              className="mt-1"
            >
              <Select.Value placeholder="Select a trigger" />
            </Select.Trigger>
            <Select.Content>
              {(nonCustomTriggers ?? []).map(({ trigger }) => (
                <Select.Item key={trigger.id} value={trigger.id}>
                  <div className="inline-flex items-center gap-2">
                    <IconComponent
                      className="size-3 shrink-0"
                      name={trigger.icon}
                    />
                    {trigger.label || trigger.type}
                  </div>
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <Form.Description id={`target-trigger-help-${actionId}`}>
            Choose which trigger’s output to wait for.
          </Form.Description>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
}
