import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { Form, Input } from 'erxes-ui';
import { TAppsForm } from '../hooks/useAppsForm';

export const AppsForm = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'apps' });
  const form = useFormContext<TAppsForm>();
  return (
    <div className="flex flex-col gap-3">
      <Form.Field
        control={form.control}
        name="name"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('app-name')}</Form.Label>
            <Form.Description className="sr-only">
              {t('app-name')}
            </Form.Description>
            <Form.Control>
              <Input {...field} placeholder={t('my-app')} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
