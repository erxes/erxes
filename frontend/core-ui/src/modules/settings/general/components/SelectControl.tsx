import { Select, Form } from 'erxes-ui';
import { Control, Path } from 'react-hook-form';
import { TGeneralSettingsProps } from '@/settings/general/types';

type Props = {
  name: string;
  control: Control<TGeneralSettingsProps>;
  label: string;
  placeholder?: string;
  options?: {
    label: string;
    value: string;
  }[];
};

const SelectControl = ({
  name,
  control,
  placeholder,
  options,
  label,
}: Props) => {
  return (
    <Form.Field
      name={name as Path<TGeneralSettingsProps>}
      control={control}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{label}</Form.Label>
          <Select
            defaultValue={field.value as Path<TGeneralSettingsProps>}
            onValueChange={(value) => field.onChange(value)}
          >
            <Form.Control>
              <Select.Trigger>
                <Select.Value placeholder={placeholder} />
              </Select.Trigger>
            </Form.Control>
            <Select.Content>
              {options?.map((opt, idx) => (
                <Select.Item key={idx} value={opt.value}>
                  {opt.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export default SelectControl;
