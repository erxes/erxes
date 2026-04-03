import { Control, FieldPathByValue } from 'react-hook-form';
import { Form, Input, IconPicker } from 'erxes-ui';
import { AmenityCreateFormType } from '../constants/formSchema';

type AmenityTextFieldPath = FieldPathByValue<
  AmenityCreateFormType,
  string | undefined
>;

interface AmenityNameFieldProps {
  control: Control<AmenityCreateFormType>;
  name?: AmenityTextFieldPath;
  labelSuffix?: string;
}

export const AmenityNameField = ({
  control,
  name = 'name',
  labelSuffix = '',
}: AmenityNameFieldProps) => {
  return (
    <Form.Field
      control={control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            Name<span className="text-primary">{labelSuffix}</span>{' '}
            <span className="text-destructive">*</span>
          </Form.Label>
          <Form.Control>
            <Input
              placeholder="e.g., Free WiFi, Swimming Pool, Parking"
              {...field}
            />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const AmenityIconField = ({
  control,
}: {
  control: Control<AmenityCreateFormType>;
}) => {
  return (
    <Form.Field
      control={control}
      name="icon"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Icon</Form.Label>
          <Form.Control>
            <IconPicker
              value={field.value}
              onValueChange={field.onChange}
              className="w-[42px] border bg-background"
            />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};
