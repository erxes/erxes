import { useFormContext } from 'react-hook-form';
import { Form, Input } from 'erxes-ui';
import { TAppsForm } from '../hooks/useAppsForm';
import { useTranslation } from 'react-i18next';

export const AppsForm = () => {
  const { t } = useTranslation('settings');
  const form = useFormContext<TAppsForm>();
  return (
    <div className="flex flex-col gap-3">
      <Form.Field
        control={form.control}
        name="name"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('apps.app-name', 'App Name')}</Form.Label>
            <Form.Description className="sr-only">{t('apps.app-name', 'App Name')}</Form.Description>
            <Form.Control>
              <Input {...field} placeholder={t('apps.app-name-placeholder', 'My App')} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
