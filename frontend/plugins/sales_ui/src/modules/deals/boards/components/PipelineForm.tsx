import { Form, Input } from 'erxes-ui';

import { TPipelineForm } from '@/deals/types/pipelines';
import { useFormContext } from 'react-hook-form';

export const PipelineForm = () => {
  const { control } = useFormContext<TPipelineForm>();

  return (
    <div className="grid grid-cols-2 gap-2">
      <Form.Field
        control={control}
        name="title"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{field.name}</Form.Label>
            <Form.Control>
              <Input {...field} placeholder="Title" />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
