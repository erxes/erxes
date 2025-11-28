import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { Form, Input } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';

export const AutomationBuilderNameInput = () => {
  const { control } = useFormContext<TAutomationBuilderForm>();
  return (
    <Form.Field
      control={control}
      name="name"
      render={({ field, fieldState }) => (
        <Form.Item>
          <Input
            placeholder={
              fieldState.error ? fieldState.error.message : 'Automation name'
            }
            className={'w-64'}
            {...field}
          />
        </Form.Item>
      )}
    />
  );
};
