import { Form, Select } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { IPropertyForm } from '../types/Properties';

export const PropertySelectRelationType = ({
  form,
}: {
  form: UseFormReturn<IPropertyForm>;
}) => {
  const type = form.watch('type');
  if (type !== 'relation') {
    return <></>;
  }
  return (
    <Form.Field
      name="relationType"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Relation Type</Form.Label>
          <Form.Control>
            <Select value={field.value} onValueChange={field.onChange}>
              <Form.Control>
                <Select.Trigger>
                  <Select.Value placeholder="Select relation type" />
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                <Select.Item value="contact">Contact</Select.Item>
                <Select.Item value="productCategory">
                  Product Category
                </Select.Item>
                <Select.Item value="product">Product</Select.Item>
                <Select.Item value="teamMembers">Team members</Select.Item>
              </Select.Content>
            </Select>
          </Form.Control>
        </Form.Item>
      )}
    />
  );
};
