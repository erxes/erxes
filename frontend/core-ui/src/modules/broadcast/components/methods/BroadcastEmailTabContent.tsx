import { EmailSenderScopeProvider } from '@/settings/mail-config/contexts/EmailSenderScope';
import { useSenderOptions } from '@/settings/mail-config/hooks/useVerifiedSenders';
import {
  BlockEditor,
  EmailPreviewDevice,
  EmailPreviewDeviceToggle,
  EmailPreviewFrame,
  Spinner,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MembersInline } from 'ui-modules';
import { useEmailContentPreview } from '@/emailTemplates/hooks/useEmailContentPreview';
import { useBroadcastBlockPreview } from '../../hooks/useBroadcastBlockPreview';
import { TBroadcastMessage } from '../../types';

const LegacyBlockContentPreview = ({ content }: { content: string }) => {
  const editor = useBroadcastBlockPreview(content);

  return (
    <BlockEditor
      editor={editor}
      readonly
      className="select-none flex-1 w-full overflow-y-auto"
    />
  );
};

const MailyContentPreview = ({ content }: { content: string }) => {
  // The saved html is the email as sent, so only its fields are filled here.
  const { html, loading, error } = useEmailContentPreview({
    content,
    contentFormat: 'maily',
  });
  const [device, setDevice] = useState<EmailPreviewDevice>('desktop');

  if (error) {
    return <p className="text-sm text-destructive">{error.message}</p>;
  }

  if (loading && !html) {
    return <Spinner />;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex justify-end">
        <EmailPreviewDeviceToggle value={device} onChange={setDevice} />
      </div>
      <EmailPreviewFrame html={html} device={device} className="flex-1" />
    </div>
  );
};

const EmailPreview = ({ message }: { message?: TBroadcastMessage }) => {
  const { fromEmail, fromUserId, email } = message || {};
  const { sender, subject, content, contentJson, replyTo } = email || {};
  const { t } = useTranslation('broadcasts');
  const { alignedFrom } = useSenderOptions();

  return (
    <div className="flex flex-col gap-8 h-full w-full">
      <div className="px-9 py-5 border rounded-md bg-muted space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Subject:</span>{' '}
          <h3 className="line-clamp-1">{subject} </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {t('composer.from')}:
          </span>
          {alignedFrom ? (
            <span className="font-semibold">
              {sender} &lt;{alignedFrom}&gt;
            </span>
          ) : fromEmail ? (
            <span className="font-semibold">
              {sender ? `${sender} <${fromEmail}>` : fromEmail}
            </span>
          ) : (
            <MembersInline
              memberIds={fromUserId ? [fromUserId] : []}
              className="font-semibold"
            />
          )}
        </div>

        {(alignedFrom ? fromEmail : replyTo) && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {t('composer.replyTo')}:
            </span>
            <span className="font-semibold">
              {alignedFrom ? fromEmail : replyTo}
            </span>
          </div>
        )}
      </div>

      {contentJson ? (
        <MailyContentPreview content={content || ''} />
      ) : (
        <LegacyBlockContentPreview content={content || ''} />
      )}
    </div>
  );
};

export const BroadcastTabPreviewEmailContent = ({
  message,
}: {
  message?: TBroadcastMessage;
}) => (
  <EmailSenderScopeProvider scope="broadcast">
    <EmailPreview message={message} />
  </EmailSenderScopeProvider>
);
