import { Form, Select } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { IPropertyForm } from '../types/Properties';
import { CORE_RELATION_TYPES } from 'ui-modules';
import { useParams } from 'react-router-dom';

export const PropertySelectRelationType = ({
  form,
}: {
  form: UseFormReturn<IPropertyForm>;
}) => {
  const { id } = useParams<{ id: string }>();

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
          <Select value={field.value} onValueChange={field.onChange} disabled={Boolean(id)}>
            <Form.Control>
              <Select.Trigger>
                <Select.Value placeholder="Select relation type" />
              </Select.Trigger>
            </Form.Control>
            <Select.Content>
              {CORE_RELATION_TYPES.map((type) => (
                <Select.Item key={type.value} value={type.value}>
                  {type.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
