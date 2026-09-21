import { Form, Input } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';

export const BroadcastSubjectField = () => {
  const { control } = useFormContext();
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });

  return (
    <Form.Field
      name="email.subject"
      control={control}
      rules={{ required: 'Email subject is required' }}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            {t('subject')}
            <span className="text-destructive">*</span>
          </Form.Label>
          <Form.Control>
            <Input {...field} placeholder={t('subject')} />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
