import { useFindObjectConfigForm } from '@/automations/components/builder/nodes/actions/findObject/hooks/useFindObjectConfigForm';
import { TAutomationFindObjectConfig } from '@/automations/components/builder/nodes/actions/findObject/states/findObjectConfigForm';
import { AutomationConfigFormWrapper } from '@/automations/components/builder/nodes/components/AutomationConfigFormWrapper';
import { Form, Select } from 'erxes-ui';
import { FormProvider } from 'react-hook-form';
import {
  PlaceholderInput,
  TAutomationActionProps,
  TPlaceholderInputSuggestion,
} from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const FindObjectConfigForm = ({
  currentAction,
  handleSave,
}: TAutomationActionProps<TAutomationFindObjectConfig>) => {
  const { t } = useTranslation('automations');
  const { form, targets, objectType, lookupFields, valueDisabled, onSave } =
    useFindObjectConfigForm({ currentAction, handleSave });

  return (
    <FormProvider {...form}>
      <AutomationConfigFormWrapper onSave={onSave}>
        <Form.Field
          control={form.control}
          name="objectType"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('record-type')}</Form.Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <Select.Trigger>
                  <Select.Value placeholder={t('select-record-type')} />
                </Select.Trigger>
                <Select.Content>
                  {targets.map((target) => (
                    <Select.Item key={target.value} value={target.value}>
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
                <Form.Label>{t('lookup-by')}</Form.Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value placeholder={t('select-lookup-field')} />
                  </Select.Trigger>
                  <Select.Content>
                    {lookupFields.map((option) => (
                      <Select.Item key={option.value} value={option.value}>
                        {option.label}
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
                <Form.Label>{t('value')}</Form.Label>
                <PlaceholderInput
                  propertyType={objectType}
                  isDisabled={valueDisabled}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  disabled={[TPlaceholderInputSuggestion.Attribute]}
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
