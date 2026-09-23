import { zodResolver } from '@hookform/resolvers/zod';
import { IconCheck, IconX } from '@tabler/icons-react';
import DOMPurify from 'dompurify';
import { Button, Form, Input, Spinner } from 'erxes-ui';
import React, { useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { MailDraftEdit } from '../hooks/useMailDrafts';

const hasText = (html: string) =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .trim().length > 0;

const buildDraftSchema = (bodyRequired: string) =>
  z.object({
    subject: z.string().optional().default(''),
    body: z.string().refine(hasText, bodyRequired),
  });

type TMailDraftForm = z.infer<ReturnType<typeof buildDraftSchema>>;

interface MailDraftEditFormProps {
  subject?: string;
  body?: string;
  saving: boolean;
  onSave: (edit: MailDraftEdit) => void;
  onCancel: () => void;
}

export const MailDraftEditForm: React.FC<MailDraftEditFormProps> = ({
  subject,
  body,
  saving,
  onSave,
  onCancel,
}) => {
  const { t } = useTranslation('frontline');
  const bodyRef = useRef<HTMLDivElement>(null);
  const initialBody = useRef(body ?? '');

  const schema = useMemo(
    () =>
      buildDraftSchema(
        t('message-body-cannot-be-empty', 'Message body cannot be empty'),
      ),
    [t],
  );

  const form = useForm<TMailDraftForm>({
    resolver: zodResolver(schema),
    defaultValues: { subject: subject ?? '', body: body ?? '' },
  });

  useEffect(() => {
    if (!bodyRef.current) {
      return;
    }

    bodyRef.current.innerHTML = DOMPurify.sanitize(initialBody.current);
    bodyRef.current.focus();
  }, []);

  const submit = form.handleSubmit((values) =>
    onSave({ subject: values.subject, body: values.body }),
  );

  return (
    <Form {...form}>
      <form className="px-4 py-3 space-y-2" onSubmit={submit}>
        <Form.Field
          control={form.control}
          name="subject"
          render={({ field }) => (
            <Form.Item>
              <Form.Control>
                <Input
                  {...field}
                  value={field.value || ''}
                  placeholder={t('subject', 'Subject')}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name="body"
          render={({ field }) => (
            <Form.Item>
              <Form.Control>
                <div
                  ref={bodyRef}
                  contentEditable
                  suppressContentEditableWarning
                  role="textbox"
                  aria-multiline="true"
                  aria-label={t('email-body', 'Email body')}
                  tabIndex={0}
                  className="min-h-[120px] max-h-[320px] overflow-y-auto rounded-md border px-3 py-2 text-[13px] leading-relaxed text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  onInput={(event) =>
                    field.onChange(event.currentTarget.innerHTML)
                  }
                  onBlur={field.onBlur}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        <div className="flex items-center gap-2 pt-1">
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? <Spinner size="sm" /> : <IconCheck size={14} />}
            {t('save', 'Save')}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onCancel}
            disabled={saving}
          >
            <IconX size={14} />
            {t('cancel', 'Cancel')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
