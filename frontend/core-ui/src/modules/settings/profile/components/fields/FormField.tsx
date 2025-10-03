import { ControllerRenderProps, Path, useFormContext } from 'react-hook-form';
import { FormType } from '@/settings/profile/hooks/useProfileForm';
import { DatePicker, Form, Input, PhoneInput } from 'erxes-ui';
import { SelectPositions } from 'ui-modules';

type RenderProps = {
  field: ControllerRenderProps;
  element: string;
  attributes: Record<string, unknown>;
};

type Props = {
  name: keyof FormType;
  element: string;
  attributes: Record<string, unknown>;
};

const RenderFormField = ({ field, element, attributes }: RenderProps) => {
  const form = useFormContext<FormType>();
  const fieldState = form.getFieldState(field.name as Path<FormType>);

  switch (element) {
    case 'input':
      return (
        <Input
          {...field}
          {...attributes}
          className={`${fieldState.error && ' focus-visible:ring-red-500'}`}
        />
      );
    case 'date':
      return (
        <DatePicker {...field} {...attributes} defaultMonth={field.value} />
      );
    case 'telephone':
      return <PhoneInput value={field.value} onChange={field.onChange} />;
    default:
      return <></>;
  }
};

const FormField = ({ name, element, attributes }: Props) => {
  const form = useFormContext<FormType>();

  return (
    <Form.Field
      key={name}
      name={name}
      control={form.control}
      render={({ field }: { field: any }) => (
        <Form.Item>
          <Form.Control>
            <RenderFormField
              field={field}
              element={element}
              attributes={attributes}
            />
          </Form.Control>
        </Form.Item>
      )}
    />
  );
};

export default FormField;
