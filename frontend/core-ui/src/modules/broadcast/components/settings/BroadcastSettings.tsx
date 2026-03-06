import { BROADCAST_SETTINGS_CONFIG_FIELDS } from '@/broadcast/constants';
import { useConfig } from '@/settings/file-upload/hook/useConfigs';
import { Form, Input } from 'erxes-ui';
import { useEffect } from 'react';
import { ControllerRenderProps, FieldValues, useForm } from 'react-hook-form';
import { BroadcastSettingsVerifiedEmail } from './BroadcastSettingsVerifiedEmail';

export const BroadcastSettings = () => {
  const form = useForm();

  const { configs, updateConfig } = useConfig();

  useEffect(() => {
    if (!configs) return;

    const values = BROADCAST_SETTINGS_CONFIG_FIELDS.reduce((acc, { name }) => {
      const config = configs.find((c: { code: string }) => c.code === name);

      if (config) acc[name] = config.value;

      return acc;
    }, {} as Record<string, any>);

    form.reset(values);
  }, [configs]);

  const handleFieldChange = (
    field: ControllerRenderProps<FieldValues, string>,
  ) => {
    const { name, value } = field || {};

    if (!name) return;

    if (!form.formState.dirtyFields[name]) return;

    updateConfig({ [name]: value }, { skipConfirm: true });
  };

  return (
    <Form {...form}>
      <form className="w-full h-full grid grid-cols-2 gap-4">
        {BROADCAST_SETTINGS_CONFIG_FIELDS.map(({ name, label, type }) => (
          <Form.Field
            key={name}
            name={name}
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{label}</Form.Label>
                <Form.Control>
                  <Input
                    {...field}
                    placeholder={label}
                    type={type}
                    onBlur={(e) => handleFieldChange(field)}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
        ))}

        <Form.Field
          key="verifiedEmail"
          name="verifiedEmail"
          control={form.control}
          render={() => (
            <Form.Item>
              <Form.Label>Verified emails</Form.Label>
              <Form.Control>
                <BroadcastSettingsVerifiedEmail />
              </Form.Control>
            </Form.Item>
          )}
        />
      </form>
    </Form>
  );
};
