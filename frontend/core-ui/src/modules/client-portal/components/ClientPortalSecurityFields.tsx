import { CLIENTPORTAL_OTP_SCHEMA } from '@/client-portal/constants/clientPortalEditSchema';
import { Form, Input, Select, Switch } from 'erxes-ui';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

type TFieldProps<TForm extends FieldValues> = {
  control: Control<TForm>;
  name: FieldPath<TForm>;
  label: string;
  description: string;
};

export const ClientPortalNumberField = <TForm extends FieldValues>({
  control,
  name,
  label,
  description,
}: TFieldProps<TForm>) => (
  <Form.Field
    control={control}
    name={name}
    render={({ field }) => (
      <Form.Item>
        <Form.Label>{label}</Form.Label>
        <Form.Control>
          <Input
            type="number"
            {...field}
            value={field.value ?? ''}
            onChange={(e) => field.onChange(Number(e.target.value))}
          />
        </Form.Control>
        <Form.Description>{description}</Form.Description>
        <Form.Message />
      </Form.Item>
    )}
  />
);

export const ClientPortalTextField = <TForm extends FieldValues>({
  control,
  name,
  label,
  description,
  fullWidth,
}: TFieldProps<TForm> & { fullWidth?: boolean }) => (
  <Form.Field
    control={control}
    name={name}
    render={({ field }) => (
      <Form.Item className={fullWidth ? 'col-span-2' : undefined}>
        <Form.Label>{label}</Form.Label>
        <Form.Control>
          <Input {...field} />
        </Form.Control>
        <Form.Description>{description}</Form.Description>
        <Form.Message />
      </Form.Item>
    )}
  />
);

const ClientPortalSwitchField = <TForm extends FieldValues>({
  control,
  name,
  label,
}: Omit<TFieldProps<TForm>, 'description'>) => (
  <Form.Field
    control={control}
    name={name}
    render={({ field }) => (
      <Form.Item className="col-span-2 flex items-center gap-2 space-y-0">
        <Form.Control>
          <Switch
            checked={field.value ?? false}
            onCheckedChange={field.onChange}
          />
        </Form.Control>
        <Form.Label variant="peer">{label}</Form.Label>
        <Form.Message />
      </Form.Item>
    )}
  />
);

type TOtpForm = z.infer<typeof CLIENTPORTAL_OTP_SCHEMA>;

export const ClientPortalOtpChannelFields = ({
  control,
  channel,
}: {
  control: Control<TOtpForm>;
  channel: 'email' | 'sms';
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'client-portals' });

  return (
    <div className="grid grid-cols-2 gap-4">
      {channel === 'email' ? (
        <>
          <ClientPortalSwitchField
            control={control}
            name="email.enableEmailVerification"
            label={t('enable-email-verification')}
          />
          <ClientPortalSwitchField
            control={control}
            name="email.enablePasswordlessLogin"
            label={t('enable-passwordless-login')}
          />
          <ClientPortalTextField
            control={control}
            name="email.emailSubject"
            label={t('email-subject')}
            description={t('otp-email-subject')}
          />
        </>
      ) : (
        <>
          <ClientPortalSwitchField
            control={control}
            name="sms.enablePhoneVerification"
            label={t('enable-phone-verification')}
          />
          <ClientPortalSwitchField
            control={control}
            name="sms.enablePasswordlessLogin"
            label={t('enable-passwordless-login')}
          />
          <Form.Field
            control={control}
            name="sms.smsProvider"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('sms-provider')}</Form.Label>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Form.Control>
                    <Select.Trigger>
                      <Select.Value placeholder={t('select-sms-provider')} />
                    </Select.Trigger>
                  </Form.Control>
                  <Select.Content>
                    <Select.Item value="callPro">CallPro</Select.Item>
                    <Select.Item value="twilio">Twilio</Select.Item>
                  </Select.Content>
                </Select>
                <Form.Description>
                  {t('select-sms-provider-description')}
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />
        </>
      )}
      <ClientPortalNumberField
        control={control}
        name={`${channel}.codeLength` as const}
        label={t('code-length')}
        description={t('otp-code-length-description')}
      />
      <ClientPortalTextField
        control={control}
        name={`${channel}.messageTemplate` as const}
        label={t('message-template')}
        description={t(`${channel}-message-body-description`, {
          placeholder: '{{code}}',
        })}
        fullWidth
      />
      <ClientPortalNumberField
        control={control}
        name={`${channel}.duration` as const}
        label={t('expiration-duration-minutes')}
        description={t('otp-expiration-description')}
      />
    </div>
  );
};
