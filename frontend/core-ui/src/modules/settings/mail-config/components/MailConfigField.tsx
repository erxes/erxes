import { Form, Input, Select, cn } from 'erxes-ui';
import { ControllerRenderProps, useFormContext } from 'react-hook-form';
import { TInput } from '@/settings/mail-config/types';

const MailConfigFieldControl = ({
  input: { inputType, type, description, options },
  field,
}: {
  input: TInput;
  field: ControllerRenderProps;
}) => {
  if (inputType === 'editor') {
    return (
      <div className="w-full p-3 text-sm leading-[140%] font-normal bg-primary/6 text-primary rounded-lg border border-primary/30">
        {description}
      </div>
    );
  }

  if (inputType === 'select') {
    return (
      <Select value={field.value} onValueChange={field.onChange}>
        <Form.Control>
          <Select.Trigger className="h-7 capitalize">
            <Select.Value />
          </Select.Trigger>
        </Form.Control>
        <Select.Content>
          {options?.map((option) => (
            <Select.Item key={option} value={option} className="capitalize">
              {option}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    );
  }

  return (
    <Form.Control>
      <Input type={type} {...field} className="h-7" />
    </Form.Control>
  );
};

export const MailConfigField = ({ input }: { input: TInput }) => {
  const { control } = useFormContext();

  return (
    <Form.Field
      control={control}
      name={input.name}
      render={({ field }) => (
        <Form.Item
          className={cn('flex flex-col justify-between', input.className)}
        >
          <div>
            <Form.Label>{input.label}</Form.Label>
            {input.inputType !== 'editor' && input.description && (
              <Form.Description>{input.description}</Form.Description>
            )}
          </div>
          <MailConfigFieldControl input={input} field={field} />
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
