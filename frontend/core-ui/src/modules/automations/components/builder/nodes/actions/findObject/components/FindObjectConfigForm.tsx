import {
  findObjectConfigFormSchema,
  TAutomationFindObjectConfig,
} from '@/automations/components/builder/nodes/actions/findObject/states/findObjectConfigForm';
import { AutomationConfigFormWrapper } from '@/automations/components/builder/nodes/components/AutomationConfigFormWrapper';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Select } from 'erxes-ui';
import { useMemo } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { PlaceholderInput, TAutomationActionProps, useFormValidationErrorHandler } from 'ui-modules';

export const FindObjectConfigForm = ({
  currentAction,
  handleSave,
}: TAutomationActionProps<TAutomationFindObjectConfig>) => {
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Find object Configuration',
  });
  const { findObjectTargetsConst } = useAutomation();
  const form = useForm<TAutomationFindObjectConfig>({
    resolver: zodResolver(findObjectConfigFormSchema),
    defaultValues: {
      objectType: currentAction?.config?.objectType || '',
      lookupField: currentAction?.config?.lookupField || '',
      value: currentAction?.config?.value || '',
    },
  });
  const [objectType, lookupField] = useWatch({
    control: form.control,
    name: ['objectType', 'lookupField'],
  });

  const lookupFields = useMemo(() => {
    const targetConst = findObjectTargetsConst.find(
      ({ value }) => value === objectType,
    );
    return targetConst?.lookupFields || [];
  }, [findObjectTargetsConst, objectType]);

  return (
    <FormProvider {...form}>
      <AutomationConfigFormWrapper
        onSave={form.handleSubmit(handleSave, handleValidationErrors)}
      >
        <Form.Field
          control={form.control}
          name="objectType"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Record Type</Form.Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <Select.Trigger>
                  <Select.Value placeholder="Select a record type" />
                </Select.Trigger>
                <Select.Content>
                  {findObjectTargetsConst.map((target) => (
                    <Select.Item
                      key={target.value}
                      value={target.value}
                    >
                      {target.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </Form.Item>
          )}
        />
        <div className="flex flex-col gap-2">
          <Form.Field
            control={form.control}
            name="lookupField"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Lookup By</Form.Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value placeholder="Select a lookup field" />
                  </Select.Trigger>
                  <Select.Content>
                    {lookupFields.map((lookupField: any) => (
                      <Select.Item
                        key={lookupField.value}
                        value={lookupField.value}
                      >
                        {lookupField.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="value"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Value</Form.Label>
                <PlaceholderInput
                  propertyType={objectType}
                  isDisabled={!lookupField || !objectType}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  disabled={{ attribute: true }}
                />
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
      </AutomationConfigFormWrapper>
    </FormProvider>
  );
};
