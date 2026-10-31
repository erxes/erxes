import { cn, Form, Input, Textarea } from 'erxes-ui';
import { useContext } from 'react';
import { PANEL_INPUT_CLASS_NAME } from 'ui-modules';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { KbFormItem, KbFormPanelContext } from './KbFormLayout';

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
  const panel = useContext(KbFormPanelContext);
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <KbFormItem label={label} required={required} wide={multiline}>
          <Form.Control>
            {multiline ? (
              <Textarea
                {...field}
                value={typeof field.value === 'string' ? field.value : ''}
                className={className}
                placeholder={placeholder}
              />
            ) : (
              <Input
                {...field}
                value={typeof field.value === 'string' ? field.value : ''}
                className={cn(panel && PANEL_INPUT_CLASS_NAME, className)}
                placeholder={placeholder}
              />
            )}
          </Form.Control>
          {description ? (
            <Form.Description>{description}</Form.Description>
          ) : null}
          <Form.Message />
        </KbFormItem>
      )}
    />
  );
}
