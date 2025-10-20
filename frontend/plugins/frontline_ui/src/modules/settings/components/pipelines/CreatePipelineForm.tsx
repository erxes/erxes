import { Form, Input, Textarea } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { IPipeline } from '@/channels/types';

export const CreatePipelineForm = ({
  form,
}: {
  form: UseFormReturn<IPipeline>;
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="w-full flex gap-2">
        <Form.Field
          control={form.control}
          name="name"
          render={({ field }) => (
            <Form.Item className="flex-auto">
              <Form.Label>Pipeline name</Form.Label>
              <Form.Description className="sr-only">
                Pipeline Name
              </Form.Description>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
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
