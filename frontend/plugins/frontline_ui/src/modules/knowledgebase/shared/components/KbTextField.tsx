import { Form, Input, Textarea } from 'erxes-ui';
import type { Control, FieldValues, Path } from 'react-hook-form';

export function KbTextField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  required,
  multiline,
  className,
}: Readonly<{
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  multiline?: boolean;
  className?: string;
}>) {
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            {label}
            {required ? (
              <>
                {' '}
                <span className="text-destructive">*</span>
              </>
            ) : null}
          </Form.Label>
          <Form.Control>
            {multiline ? (
              <Textarea
                {...field}
                value={(field.value as string) ?? ''}
                className={className}
                placeholder={placeholder}
              />
            ) : (
              <Input
                {...field}
                value={(field.value as string) ?? ''}
                className={className}
                placeholder={placeholder}
              />
            )}
          </Form.Control>
          {description ? (
            <Form.Description>{description}</Form.Description>
          ) : null}
          <Form.Message />
        </Form.Item>
      )}
    />
  );
}
