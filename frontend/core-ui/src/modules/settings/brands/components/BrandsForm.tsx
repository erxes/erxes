import { useFormContext } from 'react-hook-form';
import { Form, Input, Textarea } from 'erxes-ui';
import { TBrandsForm } from '../types';

export const BrandsForm = () => {
  const form = useFormContext<TBrandsForm>();
  return (
    <div className="flex flex-col gap-3">
      <Form.Field
        control={form.control}
        name="name"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Brand name</Form.Label>
            <Form.Description className="sr-only">Brand name</Form.Description>
            <Form.Control>
              <Input {...field} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="description"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>description</Form.Label>
            <Form.Description className="sr-only">description</Form.Description>
            <Form.Control>
              <Textarea {...field} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
