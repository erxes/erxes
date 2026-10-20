import { ManagePropertyRule } from '@/automations/components/builder/nodes/actions/manageProperties/components/ManagePropertyRule';
import { ManagePropertiesConfigFormSkeleton } from '@/automations/components/builder/nodes/actions/manageProperties/components/ManagePropertiesConfigFormSkeleton';
import { useManagePropertySidebarContent } from '@/automations/components/builder/nodes/actions/manageProperties/hooks/useManagePropertySidebarContent';
import {
  managePropertiesFormSchema,
  TManagePropertiesForm,
} from '@/automations/components/builder/nodes/actions/manageProperties/states/managePropertiesForm';
import { AutomationSortableRules } from '@/automations/components/builder/sidebar/components/content/action/conditional/AutomationRuleCard';
import { AutomationConfigFormWrapper } from '@/automations/components/builder/nodes/components/AutomationConfigFormWrapper';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconInfoCircle, IconPlus } from '@tabler/icons-react';
import { Alert, Button, Form, Label, Select } from 'erxes-ui';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import {
  TAutomationAction,
  TAutomationActionProps,
  useFormValidationErrorHandler,
} from 'ui-modules';
import { useTranslation } from 'react-i18next';

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
  const {
    propertyTypes,
    propertyType,
    sourceType,
    isPropertyTypeValid,
    loading,
  } = useManagePropertySidebarContent(currentAction, form);
  const { t } = useTranslation('automations');
  const { fields, append, remove, move, replace } = useFieldArray({
    control: form.control,
    name: 'rules',
  });
  if (loading) {
    return <ManagePropertiesConfigFormSkeleton />;
  }

  if (!propertyType || !isPropertyTypeValid) {
    return (
      <div className="p-4">
        <Alert variant="default" className="mb-4">
          <IconInfoCircle className="mr-2 inline size-4 text-muted-foreground" />
          <Alert.Title>{t('no-matching-context-title')}</Alert.Title>
          <Alert.Description>
            {t('no-matching-context-description')}
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
          <Form.Field
            control={form.control}
            name="module"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('property-type')}</Form.Label>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    const selectedPropertyTarget = propertyTypes.find(
                      (target) => target.value === value,
                    );

                    field.onChange(value);
                    form.setValue('setPropertyTarget', selectedPropertyTarget, {
                      shouldDirty: true,
                      shouldTouch: true,
                    });
                    replace([{ field: '', operator: '' }]);
                  }}
                >
                  <Select.Trigger>
                    <Select.Value placeholder={t('select-property-type')} />
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
          <div className="mt-4 flex flex-col gap-3">
            <Label>{t('rules')}</Label>
            <AutomationSortableRules
              ids={fields.map((field) => field.id)}
              onReorder={move}
            >
              {fields.map((field, index) => (
                <ManagePropertyRule
                  key={field.id}
                  id={field.id}
                  index={index}
                  onRemove={() => remove(index)}
                  propertyType={propertyType}
                  sourceType={sourceType}
                />
              ))}
            </AutomationSortableRules>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => append({ field: '', operator: '' })}
            >
              <IconPlus />
              {t('add-rule')}
            </Button>
          </div>
        </div>
      </AutomationConfigFormWrapper>
    </FormProvider>
  );
};
