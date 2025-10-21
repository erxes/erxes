import {
  findObjectConfigFormSchema,
  TAutomationFindObjectConfig,
} from '@/automations/components/builder/nodes/actions/findObject/states/findObjectConfigForm';
import { AutomationCoreConfigFormWrapper } from '@/automations/components/builder/nodes/components/AutomationConfigFormWrapper';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useFormValidationErrorHandler } from '@/automations/hooks/useFormValidationErrorHandler';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Select } from 'erxes-ui';
import { useMemo } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { PlaceHolderInput, TAutomationActionProps } from 'ui-modules';

export const FindObjectConfigForm = ({
  currentAction,
  handleSave,
}: TAutomationActionProps<TAutomationFindObjectConfig>) => {
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Find object Configuration',
  });
  const { propertyTypesConst } = useAutomation();
  const form = useForm<TAutomationFindObjectConfig>({
    resolver: zodResolver(findObjectConfigFormSchema),
    defaultValues: {
      propertyType: currentAction?.config?.propertyType || '',
      propertyField: currentAction?.config?.propertyField || '',
      propertyValue: currentAction?.config?.propertyValue || '',
    },
  });
  const [propertyType, propertyField] = useWatch({
    control: form.control,
    name: ['propertyType', 'propertyField'],
  });

  const fields = useMemo(() => {
    const propertyTypeConst = propertyTypesConst.find(
      ({ value }) => value === propertyType,
    );
    return propertyTypeConst?.fields || [];
  }, [propertyTypesConst, propertyType]);

  return (
    <FormProvider {...form}>
      <AutomationCoreConfigFormWrapper
        onSave={form.handleSubmit(handleSave, handleValidationErrors)}
      >
        <Form.Field
          control={form.control}
          name="propertyType"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Property Type</Form.Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <Select.Trigger>
                  <Select.Value placeholder="Select a property type" />
                </Select.Trigger>
                <Select.Content>
                  {propertyTypesConst.map((propertyType) => (
                    <Select.Item
                      key={propertyType.value}
                      value={propertyType.value}
                    >
                      {propertyType.label}
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
            name="propertyField"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Property Field</Form.Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value placeholder="Select a property field" />
                  </Select.Trigger>
                  <Select.Content>
                    {fields.map((field: any) => (
                      <Select.Item key={field.value} value={field.value}>
                        {field.label}
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
            name="propertyValue"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Property Value</Form.Label>
                <PlaceHolderInput
                  propertyType={propertyType}
                  isDisabled={!propertyField || !propertyType}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
      </AutomationCoreConfigFormWrapper>
    </FormProvider>
  );
};
