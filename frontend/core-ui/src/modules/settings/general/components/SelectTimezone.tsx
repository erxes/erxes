import { Form, TimezoneSelect } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { TGeneralSettingsProps } from '../types';
import { useTranslation } from 'react-i18next';

export function SelectTimezone() {
  const form = useFormContext<TGeneralSettingsProps>();
  const { t } = useTranslation('settings', {
    keyPrefix: 'general',
  });

  return (
    <Form.Field
      control={form.control}
      name="TIMEZONE"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('timezone')}</Form.Label>
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
