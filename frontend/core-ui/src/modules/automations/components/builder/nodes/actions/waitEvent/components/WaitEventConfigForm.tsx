import { WaitEventConfigContent } from '@/automations/components/builder/nodes/actions/waitEvent/components/WaitEventConfigContent';
import { useWaitEventConfigForm } from '@/automations/components/builder/nodes/actions/waitEvent/hooks/useWaitEventConfigForm';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { Form, IconComponent, Select } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { TAutomationActionProps } from 'ui-modules';

export const WaitEventConfigForm = ({
  currentAction,
  currentActionIndex,
  handleSave,
}: TAutomationActionProps) => {
  const { control } = useFormContext<TAutomationBuilderForm>();

  const {
    waitEventOptions,
    configFieldNamePrefix,
    config,
    onSelectTargetTypeId,
  } = useWaitEventConfigForm(currentAction, currentActionIndex);

  const { targetType } = config || {};

  const effectiveTargetType = targetType ?? waitEventOptions[0]?.type;

  return (
    <div className="h-full min-h-0 flex flex-col gap-4 overflow-hidden">
      <Form.Field
        name={`${configFieldNamePrefix}.targetTypeId`}
        control={control}
        defaultValue={waitEventOptions[0]?.id}
        render={({ field }) => (
          <Form.Item className="px-4">
            <Form.Label>Select target ({`${field.value}`})</Form.Label>
            <Select
              value={field.value ?? waitEventOptions[0]?.id}
              onValueChange={onSelectTargetTypeId}
            >
              <Select.Trigger
                id={`target-type-${currentAction.id}`}
                aria-describedby={`target-type-help-${currentAction.id}`}
                className="mt-1"
              >
                <Select.Value placeholder="Select target type" />
              </Select.Trigger>
              <Select.Content>
                {waitEventOptions.map(({ id, label, icon }) => (
                  <Select.Item key={id} value={id}>
                    <div className="flex items-center gap-2 w-full">
                      {icon && <IconComponent name={icon} className="size-4" />}
                      {label}
                    </div>
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
        selectedNodeId={config?.targetTypeId}
        configFieldNamePrefix={configFieldNamePrefix}
        handleSave={handleSave}
      />
    </div>
  );
};
