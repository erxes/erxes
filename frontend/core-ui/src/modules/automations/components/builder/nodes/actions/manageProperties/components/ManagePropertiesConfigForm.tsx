import { ManagePropertyRule } from '@/automations/components/builder/nodes/actions/manageProperties/components/ManagePropertyRule';
import { useManagePropertySidebarContent } from '@/automations/components/builder/nodes/actions/manageProperties/hooks/useManagePropertySidebarContent';
import {
  managePropertiesFormSchema,
  TManagePropertiesForm,
} from '@/automations/components/builder/nodes/actions/manageProperties/states/managePropertiesForm';
import { AutomationConfigFormWrapper } from '@/automations/components/builder/nodes/components/AutomationConfigFormWrapper';
import { useFormValidationErrorHandler } from '@/automations/hooks/useFormValidationErrorHandler';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconInfoCircle } from '@tabler/icons-react';
import { Alert, Button, Form, Label, Select } from 'erxes-ui';
import { FormProvider, useForm } from 'react-hook-form';
import { TAutomationAction, TAutomationActionProps } from 'ui-modules';

const generateDefaultValues = (currentAction: TAutomationAction) => {
  const values = { ...(currentAction?.config || {}) };
  if (!values.rules?.length) {
    values.rules = [{ field: '', operator: '' }];
  }
  return values;
};

export const ManagePropertiesConfigForm = ({
  currentAction,
  handleSave,
}: TAutomationActionProps<TManagePropertiesForm>) => {
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Manage properties Configuration',
  });

  const form = useForm<TManagePropertiesForm>({
    resolver: zodResolver(managePropertiesFormSchema),
    defaultValues: generateDefaultValues(currentAction),
  });
  const { propertyTypes, propertyType } = useManagePropertySidebarContent(
    currentAction,
    form,
  );

  if (!propertyType) {
    return (
      <div className="p-4">
        <Alert variant="default" className="mb-4">
          <IconInfoCircle className="mr-2 inline size-4 text-muted-foreground" />
          <Alert.Title>We couldn’t find a matching context</Alert.Title>
          <Alert.Description>
            This action may not apply to the current workflow. Select a module
            or choose a trigger/action to proceed.
          </Alert.Description>
        </Alert>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <AutomationConfigFormWrapper
        onSave={form.handleSubmit(handleSave, handleValidationErrors)}
      >
        <div className="w-[500px]">
          {/* <SelectManagePropertyTriggerTarget
            nonCustomTriggers={nonCustomTriggers}
          /> */}
          {/* <SelectManagePropertyActionTarget
            actionsCanBeTarget={actionsCanBeTarget}
          /> */}
          <Form.Field
            control={form.control}
            name="module"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Property Type</Form.Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value placeholder="Select a property type" />
                  </Select.Trigger>
                  <Select.Content>
                    {propertyTypes.map(({ value, description }) => (
                      <Select.Item key={value} value={value}>
                        {description}
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
            name="rules"
            render={({ field: { value: rules = [], onChange } }) => (
              <Form.Item>
                <Form.Label>Rules</Form.Label>

                {rules.map((rule, index) => (
                  <ManagePropertyRule
                    key={index}
                    rule={rule}
                    index={index}
                    propertyType={propertyType}
                  />
                ))}
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={() =>
                    onChange([...rules, { field: '', operator: '' }], {
                      shouldDirty: true,
                      shouldTouch: true,
                    })
                  }
                >
                  <Label>Add Rule</Label>
                </Button>
              </Form.Item>
            )}
          />
        </div>
      </AutomationConfigFormWrapper>
    </FormProvider>
  );
};
