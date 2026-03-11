import { Control } from 'react-hook-form';
import { Form, Input, Textarea } from 'erxes-ui';
import { TourCreateFormType } from '../constants/formSchema';

export const TourNameField = ({
  control,
}: {
  control: Control<TourCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="name"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            Name <span className="text-destructive">*</span>
          </Form.Label>
          <Form.Control>
            <Input placeholder="Tour name" {...field} />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const TourDescriptionField = ({
  control,
}: {
  control: Control<TourCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="description"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            Description <span className="text-destructive">*</span>
          </Form.Label>
          <Form.Control>
            <Textarea
              rows={5}
              placeholder="Tour description"
              className="resize-none"
              {...field}
            />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};
