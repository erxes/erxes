import { Form, Checkbox } from 'erxes-ui';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

interface FormCheckboxProps<T extends FieldValues> {
  name: FieldPath<T>;
  label: string;
  control: Control<T>;
  labelPosition?: 'before' | 'after';
}

export const FormCheckbox = <T extends FieldValues>({
  name,
  label,
  control,
  labelPosition = 'after',
}: FormCheckboxProps<T>) => {
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item className="flex items-center gap-2 space-y-0">
          {labelPosition === 'before' && (
            <Form.Label variant="peer">{label}</Form.Label>
          )}
          <Form.Control>
            <Checkbox
              checked={field.value || false}
              onCheckedChange={field.onChange}
            />
          </Form.Control>
          {labelPosition === 'after' && (
            <Form.Label variant="peer">{label}</Form.Label>
          )}
        </Form.Item>
      )}
    />
  );
};
