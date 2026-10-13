import { Form } from 'erxes-ui';
import { FieldValues, FormProvider, UseFormReturn } from 'react-hook-form';
import { useAutomationConditionalValueForm } from '../../hooks/useAutomationConditionalValueForm';
import { TAutomationConditionalFieldRender } from '../../types/conditionalTypes';

export const AutomationConditionalValueSlot = ({
  parentForm,
  names,
  values,
  onChange,
  render,
}: {
  parentForm: UseFormReturn<FieldValues>;
  names: string[];
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
  render: TAutomationConditionalFieldRender;
}) => {
  const form = useAutomationConditionalValueForm({
    parentForm,
    names,
    values,
    onChange,
  });

  return (
    <FormProvider {...form}>
      <Form.Field
        control={form.control}
        name={names[0]}
        render={(props) => render({ ...props, form })}
      />
    </FormProvider>
  );
};
