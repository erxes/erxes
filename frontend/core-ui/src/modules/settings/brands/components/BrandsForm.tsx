import { useFormContext } from 'react-hook-form';
import { Form, Input, Textarea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TBrandsForm } from '../types';

export const BrandsForm = () => {
  const form = useFormContext<TBrandsForm>();
  const { t } = useTranslation('settings', { 
    keyPrefix: 'brands'
  });
  return (
    <div className="flex flex-col gap-3">
      <Form.Field
        control={form.control}
        name="name"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('brand-name')}</Form.Label>
            <Form.Description className="sr-only">{t('brand-name')}</Form.Description>
            <Form.Control>
              <Input {...field} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="description"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('description')}</Form.Label>
            <Form.Description className="sr-only">{t('description')}</Form.Description>
            <Form.Control>
              <Textarea {...field} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
