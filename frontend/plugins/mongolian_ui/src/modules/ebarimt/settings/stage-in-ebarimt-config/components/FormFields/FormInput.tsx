import { Form, Input } from 'erxes-ui';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

interface FormInputProps<T extends FieldValues> {
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  control: Control<T>;
  type?: 'text' | 'number';
}

export const FormInput = <T extends FieldValues>({
  name,
  label,
  placeholder,
  control,
  type = 'text',
}: FormInputProps<T>) => {
  return (
    <Form.Field
      name={name}
      control={control}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{label}</Form.Label>
          <Form.Control>
            <Input
              {...field}
              type={type}
              placeholder={placeholder || label}
              value={field.value || ''}
              onChange={(e) => field.onChange(e.target.value)}
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
