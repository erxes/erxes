import { BroadcastCredentialsNotice } from '@/broadcast/components/settings/BroadcastCredentialsNotice';
import { BROADCAST_SETTINGS_CONFIG_FIELDS } from '@/broadcast/constants';
import {
  BROADCAST_MODE_FIELD,
  BROADCAST_PROVIDER_FIELD,
} from '@/broadcast/hooks/useBroadcastEmailCredentials';
import { useBroadcastSettingsForm } from '@/broadcast/hooks/useBroadcastSettingsForm';
import { VerifiedSenders } from '@/settings/mail-config/components/VerifiedSenders';
import { EmailSenderScopeProvider } from '@/settings/mail-config/contexts/EmailSenderScope';
import { Form, Input, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const MODE_OPTIONS = [
  { value: 'default', labelKey: 'settings.mode-default' },
  { value: 'custom', labelKey: 'settings.mode-custom' },
];

const PROVIDER_OPTIONS = ['SES', 'sendgrid', 'custom'];

export const BroadcastSettings = () => {
  const { t } = useTranslation('broadcasts');
  const {
    form,
    showCredentials,
    usesOwnCredentials,
    providerFields,
    handleFieldChange,
    handleSelectChange,
  } = useBroadcastSettingsForm();

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
            t('settings.credentials'),
            MODE_OPTIONS.map(({ value, labelKey }) => ({
              value,
              label: t(labelKey),
            })),
            usesOwnCredentials ? 'custom' : 'default',
          )}

        {showCredentials && usesOwnCredentials && (
          <>
            {renderSelect(
              BROADCAST_PROVIDER_FIELD,
              t('settings.service'),
              PROVIDER_OPTIONS.map((value) => ({ value, label: value })),
            )}
            {providerFields.map(({ name, labelKey, type }) =>
              renderInput(name, t(labelKey), type),
            )}
          </>
        )}

        {BROADCAST_SETTINGS_CONFIG_FIELDS.map(({ name, labelKey, type }) =>
          renderInput(name, t(labelKey), type),
        )}

        <EmailSenderScopeProvider scope="broadcast">
          <Form.Item>
            <Form.Label>{t('settings.verified-emails')}</Form.Label>
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
