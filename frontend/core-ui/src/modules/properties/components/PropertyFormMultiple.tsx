import { UseFormReturn } from 'react-hook-form';
import { IPropertyForm } from '../types/Properties';
import { Form, Switch } from 'erxes-ui';

export const PropertyFormMultiple = ({
  form,
}: {
  form: UseFormReturn<IPropertyForm>;
}) => {
  const type = form.watch('type');

  if (!type || ['number', 'boolean', 'date'].includes(type)) {
    return null;
  }

  return (
    <Form.Field
      name="multiple"
      render={({ field }) => (
        <Form.Item>
          <div className="flex items-center gap-2">
            <Form.Control>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </Form.Control>
            <Form.Label variant="peer">Multiple</Form.Label>
          </div>
        </Form.Item>
      )}
    />
  );
};
