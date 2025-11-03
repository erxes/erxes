import { useAutomationActionTargetSelector } from '@/automations/components/builder/sidebar/hooks/useAutomationActionTargetSelector';
import { NodeData } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { Form, IconComponent, Select } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';

export const AutomationActionTargetSelector = ({
  activeNode,
}: {
  activeNode: NodeData;
}) => {
  const { control } = useFormContext<TAutomationBuilderForm>();
  const { allowTargetFromActions, configFieldNamePrefix, list } =
    useAutomationActionTargetSelector({
      activeNode,
    });

  if (!allowTargetFromActions || list.length === 0) {
    return null;
  }
  return (
    <Form.Field
      name={`${configFieldNamePrefix}.targetActionId`}
      control={control}
      defaultValue={list[0]?.id}
      render={({ field }) => (
        <Form.Item className="px-4 mb-2">
          <Form.Label>Select target</Form.Label>
          <Select
            value={field.value ?? list[0]?.id}
            onValueChange={(value) =>
              list.find((item) => item.id === value)?.type === 'trigger'
                ? field.onChange(undefined)
                : field.onChange(value)
            }
          >
            <Select.Trigger className="mt-1">
              <Select.Value placeholder="Select target type" />
            </Select.Trigger>
            <Select.Content>
              {list.map(({ id, label, icon }) => (
                <Select.Item key={id} value={id}>
                  <div className="flex items-center gap-2 w-full">
                    {icon && <IconComponent name={icon} className="size-4" />}
                    {label}
                  </div>
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <Form.Description>
            Select which action or trigger to use as the target.
          </Form.Description>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
