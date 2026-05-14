import { UseFormReturn } from 'react-hook-form';
import { IPropertyForm } from '../types/Properties';
import { Form, Input, Select } from 'erxes-ui';

export const PropertyFormValidation = ({
  form,
}: {
  form: UseFormReturn<IPropertyForm>;
}) => {
  const type = form.watch('type');

  if (type === 'text') {
    return <PropertyFormStringValidation />;
  }
  return <></>;
};

export const PropertyFormStringValidation = () => {
  return (
    <Form.Field
      name="validation"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Validation</Form.Label>

          <Select {...field} onValueChange={field.onChange}>
            <Form.Control>
              <Select.Trigger>
                <Select.Value placeholder="Select validation" />
              </Select.Trigger>
            </Form.Control>
            <Select.Content>
              <Select.Item value="text">Text</Select.Item>
              <Select.Item value="number">Number</Select.Item>
              <Select.Item value="url">URL</Select.Item>
              <Select.Item value="phone">Phone</Select.Item>
              <Select.Item value="email">Email</Select.Item>
              <Select.Item value="password">Password</Select.Item>
            </Select.Content>
          </Select>
        </Form.Item>
      )}
    />
  );
};
