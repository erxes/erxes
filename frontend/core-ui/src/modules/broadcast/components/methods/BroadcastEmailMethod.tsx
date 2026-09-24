import { EmailSenderScopeProvider } from '@/settings/mail-config/contexts/EmailSenderScope';
import { Form } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { BroadcastAttachment } from '../BroadcastAttachment';
import { BroadcastFromField } from '../BroadcastFromField';
import { BroadcastPreviewTextField } from '../BroadcastPreviewTextField';
import { BroadcastReplyToField } from '../BroadcastReplyToField';
import { BroadcastSubjectField } from '../BroadcastSubjectField';

/**
 * Everything about the email except the email itself, which is written in the
 * editor beside it — the same split every other method uses.
 */
export const BroadcastEmailMethod = () => {
  const { control } = useFormContext();
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });

  return (
    <EmailSenderScopeProvider scope="broadcast">
      <form className="flex flex-col gap-4">
        {/* Picking the confirmed address comes first: it is what fills the
            sender name beside it. */}
        <div className="grid grid-cols-2 gap-3">
          <BroadcastReplyToField />
          <BroadcastFromField />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <BroadcastSubjectField />
          <BroadcastPreviewTextField />
        </div>

        <Form.Field
          name="email.attachments"
          control={control}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('attachments')}</Form.Label>
              <Form.Control>
                <BroadcastAttachment {...field} />
              </Form.Control>
            </Form.Item>
          )}
        />
      </form>
    </EmailSenderScopeProvider>
  );
};
