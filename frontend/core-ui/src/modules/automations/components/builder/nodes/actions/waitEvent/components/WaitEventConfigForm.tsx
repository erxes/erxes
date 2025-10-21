import { WaitEventConfigContent } from '@/automations/components/builder/nodes/actions/waitEvent/components/WaitEventConfigContent';
import { useWaitEventConfigForm } from '@/automations/components/builder/nodes/actions/waitEvent/hooks/useWaitEventConfigForm';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { Form, Select } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { TAutomationActionProps } from 'ui-modules';

export const WaitEventConfigForm = ({
  currentAction,
  currentActionIndex,
  handleSave,
}: TAutomationActionProps) => {
  const { control } = useFormContext<TAutomationBuilderForm>();

  const { waitEventOptions, configFieldNamePrefix, config } =
    useWaitEventConfigForm(currentAction, currentActionIndex);

  const { targetType } = config || {};

  const effectiveTargetType = targetType ?? waitEventOptions[0]?.type;

  return (
    <div className="h-full min-h-0 flex flex-col gap-4 overflow-hidden">
      <Form.Field
        name={`${configFieldNamePrefix}.targetType`}
        control={control}
        defaultValue={waitEventOptions[0]?.type}
        render={({ field }) => (
          <Form.Item className="px-4">
            <Form.Label>Select target</Form.Label>
            <Select
              value={field.value ?? waitEventOptions[0]?.type}
              onValueChange={field.onChange}
            >
              <Select.Trigger
                id={`target-type-${currentAction.id}`}
                aria-describedby={`target-type-help-${currentAction.id}`}
                className="mt-1"
              >
                <Select.Value placeholder="Select target type" />
              </Select.Trigger>
              <Select.Content>
                {waitEventOptions.map(({ type, label }) => (
                  <Select.Item key={type} value={type}>
                    {label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Form.Description id={`target-type-help-${currentAction.id}`}>
              This determines where the event will be listened from.
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />

      <WaitEventConfigContent
        targetType={effectiveTargetType}
        action={currentAction}
        selectedNodeId={undefined}
        configFieldNamePrefix={configFieldNamePrefix}
        handleSave={handleSave}
      />
    </div>
  );
};
