import { Form, TimezoneSelect } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { TGeneralSettingsProps } from '../types';

export function SelectTimezone() {
  const form = useFormContext<TGeneralSettingsProps>();

  return (
    <Form.Field
      control={form.control}
      name="TIMEZONE"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Timezone</Form.Label>
          <Form.Control>
            <TimezoneSelect
              value={field.value}
              onValueChange={field.onChange}
            />
          </Form.Control>
        </Form.Item>
      )}
    />
  );
}
