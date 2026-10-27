import { Form, Input } from 'erxes-ui';
import { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TTemplateForm } from '../schema/templateFormSchema';

// many mail apps cut a subject past this in the inbox list
const SUBJECT_VISIBLE_LENGTH = 78;

export const NotificationTemplateHeaderFields = ({
  control,
  subject,
}: {
  control: Control<TTemplateForm>;
  subject: string;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });

  return (
    <div className="flex flex-col gap-3 bg-background p-4 border rounded-lg">
      <Form.Field
        control={control}
        name="subject"
        render={({ field }) => (
          <Form.Item>
            <div className="flex justify-between items-center">
              <Form.Label>{t('subject')}</Form.Label>
              <span
                className={
                  subject.length > SUBJECT_VISIBLE_LENGTH
                    ? 'text-[11px] text-warning'
                    : 'text-[11px] text-muted-foreground'
                }
              >
                {subject.length}/{SUBJECT_VISIBLE_LENGTH}
              </span>
            </div>
            <Form.Control>
              <Input {...field} placeholder={t('subject-placeholder')} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="preheader"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('preheader')}</Form.Label>
            <Form.Control>
              <Input {...field} placeholder={t('preheader-placeholder')} />
            </Form.Control>
            <Form.Description>{t('preheader-description')}</Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
