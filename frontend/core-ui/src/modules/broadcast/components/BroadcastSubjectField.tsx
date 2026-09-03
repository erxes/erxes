import { Form, Input } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';

export const BroadcastSubjectField = () => {
  const { control } = useFormContext();
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });

  return (
    <div className="flex items-center gap-4">
      <span className="w-20 shrink-0 text-sm text-muted-foreground">
        {t('subject')}
        <span className="text-destructive">*</span>
      </span>
      <Form.Field
        name="email.subject"
        control={control}
        rules={{ required: 'Email subject is required' }}
        render={({ field }) => (
          <Form.Item className="flex-1">
            <Form.Control>
              <Input
                {...field}
                placeholder={t('subject')}
                className="border-none shadow-none px-0 focus-visible:ring-0"
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
