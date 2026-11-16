import { ManagePropertyRule } from '@/automations/components/builder/nodes/actions/manageProperties/components/ManagePropertyRule';
import { ManagePropertiesConfigFormSkeleton } from '@/automations/components/builder/nodes/actions/manageProperties/components/ManagePropertiesConfigFormSkeleton';
import { useManagePropertiesConfigForm } from '@/automations/components/builder/nodes/actions/manageProperties/hooks/useManagePropertiesConfigForm';
import { TManagePropertiesForm } from '@/automations/components/builder/nodes/actions/manageProperties/states/managePropertiesForm';
import { AutomationSortableRules } from '@/automations/components/builder/sidebar/components/content/action/conditional/AutomationRuleCard';
import { AutomationConfigFormWrapper } from '@/automations/components/builder/nodes/components/AutomationConfigFormWrapper';
import { IconInfoCircle, IconPlus } from '@tabler/icons-react';
import { Alert, Button, Form, Label, Select } from 'erxes-ui';
import { FormProvider } from 'react-hook-form';
import { TAutomationActionProps } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const ManagePropertiesConfigForm = ({
  currentAction,
  handleSave,
}: TAutomationActionProps<TManagePropertiesForm>) => {
  const { t } = useTranslation('automations');
  const {
    form,
    loading,
    isPropertyTypeValid,
    propertyTypes,
    propertyType,
    sourceType,
    fields,
    ruleIds,
    move,
    remove,
    addRule,
    changeModule,
    onSave,
  } = useManagePropertiesConfigForm({ currentAction, handleSave });

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
      <AutomationConfigFormWrapper onSave={onSave}>
        <div className="w-[500px]">
          <Form.Field
            control={form.control}
            name="module"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('property-type')}</Form.Label>
                <Select
                  value={field.value}
                  onValueChange={changeModule(field.onChange)}
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
            <AutomationSortableRules ids={ruleIds} onReorder={move}>
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
              onClick={addRule}
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
