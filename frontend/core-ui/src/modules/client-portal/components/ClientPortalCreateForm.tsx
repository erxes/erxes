import { useFormContext } from 'react-hook-form';
import { Form, Input } from 'erxes-ui';

import { TClientPortalAddForm } from '@/client-portal/hooks/useClientPortalForm';
import { useTranslation } from 'react-i18next';

export const ClientPortalCreateForm = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'client-portals' });
  const form = useFormContext<TClientPortalAddForm>();
  return (
    <div className="flex flex-col gap-3">
      <Form.Field
        control={form.control}
        name="name"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('client-portal-name')}</Form.Label>
            <Form.Description className="sr-only">name</Form.Description>
            <Form.Control>
              <Input {...field} />
            </Form.Control>
          </Form.Item>
        )}
      />
    </div>
  );
};
