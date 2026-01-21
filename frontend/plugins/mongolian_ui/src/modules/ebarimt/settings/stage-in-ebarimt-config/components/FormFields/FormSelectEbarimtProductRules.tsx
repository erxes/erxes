import { Form } from 'erxes-ui';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { SelectEbarimtProductRules } from '../selects/SelectEbarimtProductRules';

interface FormSelectEbarimtProductRulesProps<T extends FieldValues> {
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  control: Control<T>;
  kind: 'vat' | 'ctax';
  variant?: 'filter' | 'table' | 'card' | 'detail' | 'form' | 'icon';
  scope?: string;
  disabled?: boolean;
}

export const FormSelectEbarimtProductRules = <T extends FieldValues>({
  name,
  label,
  placeholder,
  control,
  kind,
  variant = 'form',
  scope,
  disabled,
}: FormSelectEbarimtProductRulesProps<T>) => {
  return (
    <Form.Field
      name={name}
      control={control}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{label}</Form.Label>
          <Form.Control>
            <SelectEbarimtProductRules
              value={field.value || ''}
              kind={kind}
              variant={variant}
              scope={scope}
              onValueChange={field.onChange}
              disabled={disabled}
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
