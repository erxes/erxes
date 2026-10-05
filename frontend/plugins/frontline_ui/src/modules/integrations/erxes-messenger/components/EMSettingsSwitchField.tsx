import { Form, Switch } from 'erxes-ui';
import { z } from 'zod';
import { EM_SETTINGS_SCHEMA } from '../constants/emSettingsSchema';

type EMSettingsFormValues = z.infer<typeof EM_SETTINGS_SCHEMA>;

export type EMSettingsBooleanField = {
  [K in keyof EMSettingsFormValues]: EMSettingsFormValues[K] extends boolean
    ? K
    : never;
}[keyof EMSettingsFormValues];

interface EMSettingsSwitchFieldProps {
  name: EMSettingsBooleanField;
  label: string;
  description?: string;
}

export const EMSettingsSwitchField = ({
  name,
  label,
  description,
}: EMSettingsSwitchFieldProps) => {
  return (
    <Form.Field<EMSettingsFormValues, EMSettingsBooleanField>
      name={name}
      render={({ field }) => (
        <Form.Item>
          <div className="flex items-center gap-3">
            <Form.Control>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </Form.Control>

            <Form.Label variant="peer" className="leading-6">
              {label}
            </Form.Label>
          </div>
          {description && <Form.Description>{description}</Form.Description>}
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
