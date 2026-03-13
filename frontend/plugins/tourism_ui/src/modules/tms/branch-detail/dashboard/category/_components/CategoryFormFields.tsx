import { Control } from 'react-hook-form';
import { Form, Input } from 'erxes-ui';
import { CategoryCreateFormType } from '../constants/formSchema';

export const CategoryNameField = ({
  control,
}: {
  control: Control<CategoryCreateFormType>;
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
            <Input
              placeholder="e.g., Adventure Tours, Cultural Tours"
              {...field}
            />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const CategoryParentIdField = ({
  control,
}: {
  control: Control<CategoryCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="parentId"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Parent ID</Form.Label>
          <Form.Control>
            <Input placeholder="Optional parent category ID" {...field} />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};
