import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { Form, Input } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const AutomationBuilderNameInput = () => {
  const { control } = useFormContext<TAutomationBuilderForm>();
  const { t } = useTranslation('automations');
  return (
    <Form.Field
      control={control}
      name="name"
      render={({ field, fieldState }) => (
        <Form.Item>
          <Input
            autoFocus
            placeholder={
              fieldState.error ? fieldState.error.message : t('automation-name-placeholder')
            }
            className={'w-64 h-7 rounded-md'}
            {...field}
          />
        </Form.Item>
      )}
    />
  );
};
