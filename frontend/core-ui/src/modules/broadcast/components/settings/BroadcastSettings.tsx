import { BroadcastCredentialsNotice } from '@/broadcast/components/settings/BroadcastCredentialsNotice';
import { BROADCAST_SETTINGS_CONFIG_FIELDS } from '@/broadcast/constants';
import { useBroadcastConfig } from '@/broadcast/hooks/useBroadcastConfig';
import {
  BROADCAST_CONFIG_CODES,
  BROADCAST_MODE_FIELD,
  BROADCAST_PROVIDER_FIELD,
  TBroadcastEmailSettings,
  useBroadcastEmailCredentials,
} from '@/broadcast/hooks/useBroadcastEmailCredentials';
import { useConfig } from '@/settings/file-upload/hook/useConfigs';
import { VerifiedSenders } from '@/settings/mail-config/components/VerifiedSenders';
import { EmailSenderScopeProvider } from '@/settings/mail-config/contexts/EmailSenderScope';
import { Form, Input, Select } from 'erxes-ui';
import { useEffect } from 'react';
import { ControllerRenderProps, FieldValues, useForm } from 'react-hook-form';

const MODE_OPTIONS = [
  { value: 'default', label: 'Use mail config' },
  { value: 'custom', label: 'Use own credentials' },
];

const PROVIDER_OPTIONS = ['SES', 'sendgrid', 'custom'];

export const BroadcastSettings = () => {
  const form = useForm<TBroadcastEmailSettings>();

  const { configs } = useConfig();

  const { updateConfig } = useBroadcastConfig();

  const { showCredentials, usesOwnCredentials, providerFields } =
    useBroadcastEmailCredentials(form);

  useEffect(() => {
    if (!configs) return;

    const values = BROADCAST_CONFIG_CODES.reduce(
      (acc, name) => {
        const config = configs.find((c: { code: string }) => c.code === name);

        if (config) acc[name] = config.value;

      return acc;
    }, {} as Partial<TBroadcastEmailSettings>);

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

  const handleSelectChange = (name: string, value: string) => {
    form.setValue(name, value, { shouldDirty: true });
    updateConfig({ [name]: value }, { skipConfirm: true });
  };

  const renderInput = (name: string, label: string, type?: string) => (
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
              value={field.value || ''}
              placeholder={label}
              type={type}
              onBlur={() => handleFieldChange(field)}
            />
          </Form.Control>
        </Form.Item>
      )}
    />
  );

  const renderSelect = (
    name: string,
    label: string,
    options: Array<{ value: string; label: string }>,
    fallbackValue: string = options[0].value,
  ) => (
    <Form.Field
      key={name}
      name={name}
      control={form.control}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{label}</Form.Label>
          <Select
            value={field.value || fallbackValue}
            onValueChange={(value) => handleSelectChange(name, value)}
          >
            <Form.Control>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
            </Form.Control>
            <Select.Content>
              {options.map(({ value, label: optionLabel }) => (
                <Select.Item key={value} value={value}>
                  {optionLabel}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </Form.Item>
      )}
    />
  );

  return (
    <Form {...form}>
      <form className="w-full h-full grid grid-cols-2 gap-4">
        {showCredentials &&
          renderSelect(
            BROADCAST_MODE_FIELD,
            'Email credentials',
            MODE_OPTIONS,
            usesOwnCredentials ? 'custom' : 'default',
          )}

        {showCredentials && usesOwnCredentials && (
          <>
            {renderSelect(
              BROADCAST_PROVIDER_FIELD,
              'Email service',
              PROVIDER_OPTIONS.map((value) => ({ value, label: value })),
            )}
            {providerFields.map(({ name, label, type }) =>
              renderInput(name, label, type),
            )}
          </>
        )}

        {BROADCAST_SETTINGS_CONFIG_FIELDS.map(({ name, label, type }) =>
          renderInput(name, label, type),
        )}

        <EmailSenderScopeProvider scope="broadcast">
          <Form.Item>
            <Form.Label>Verified emails</Form.Label>
            <Form.Control>
              <VerifiedSenders />
            </Form.Control>
          </Form.Item>

          {usesOwnCredentials && <BroadcastCredentialsNotice />}
        </EmailSenderScopeProvider>
      </form>
    </Form>
  );
};
