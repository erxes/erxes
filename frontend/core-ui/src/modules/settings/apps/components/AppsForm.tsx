import { useFormContext } from 'react-hook-form';
import { Form, Input } from 'erxes-ui';
import { TAppsForm } from '../hooks/useAppsForm';

export const AppsForm = () => {
  const form = useFormContext<TAppsForm>();
  return (
    <div className="flex flex-col gap-3">
      <Form.Field
        control={form.control}
        name="name"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>App Name</Form.Label>
            <Form.Description className="sr-only">App Name</Form.Description>
            <Form.Control>
              <Input {...field} placeholder="My App" />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
