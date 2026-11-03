import { Checkbox, Form } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TGeneralSettingsProps } from '../types';

export function UserActivityTracking() {
  const form = useFormContext<TGeneralSettingsProps>();
  const { t } = useTranslation('settings', { keyPrefix: 'general' });

  return (
    <Form.Field
      control={form.control}
      name="USER_ACTIVITY_TRACKING"
      render={({ field }) => (
        <Form.Item>
          <div className="flex items-center gap-2">
            <Form.Control>
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(!!checked)}
              />
            </Form.Control>
            <Form.Label>{t('user-activity-tracking')}</Form.Label>
          </div>
          <Form.Description>
            {t('user-activity-tracking-description')}
          </Form.Description>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
}
