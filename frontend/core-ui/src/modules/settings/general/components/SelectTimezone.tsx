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
              value={field.value ?? ''}
              onValueChange={field.onChange}
            />
          </Form.Control>
          {/*
            This zone decides where a day begins for the whole organization:
            every date condition in a segment ("in the last 7 days", the
            anniversary rules) and every scheduled cycle resolves its day
            boundary from it. Left unset, the server falls back to its
            deployment default, which is UTC — off by a full working day for a
            tenant that is hours ahead of it.
          */}
          <Form.Description>
            {t(
              'timezone-description',
              'Decides when a day starts and ends for date-based segment conditions and scheduled work. Defaults to UTC while unset.',
            )}
          </Form.Description>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
}
