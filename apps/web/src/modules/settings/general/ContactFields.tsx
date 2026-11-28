import { Form, Input, PhoneInput } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

/** The part of the organisation form these fields edit; empty is none. */
interface ContactValues {
  phone: string;
  email: string;
}

/** How to reach the organisation, as its documents print it (3.x's structure phone and email). */
export const ContactFields = ({ disabled }: { disabled: boolean }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'general' });
  const { control } = useFormContext<ContactValues>();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Form.Field
        control={control}
        name="phone"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('phone-number', 'Phone number')}</Form.Label>
            <Form.Control>
              <PhoneInput
                value={field.value}
                disabled={disabled}
                onChange={(value) => field.onChange(value)}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="email"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('email', 'Email')}</Form.Label>
            <Form.Control>
              <Input {...field} type="email" maxLength={254} disabled={disabled} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
