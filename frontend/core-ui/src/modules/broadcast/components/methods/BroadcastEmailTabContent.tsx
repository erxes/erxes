import { EmailSenderScopeProvider } from '@/settings/mail-config/contexts/EmailSenderScope';
import {
  BlockEditor,
  EmailPreviewDeviceToggle,
  EmailPreviewFrame,
  Spinner,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { MembersInline } from 'ui-modules';
import { useBroadcastBlockPreview } from '../../hooks/useBroadcastBlockPreview';
import {
  useBroadcastEmailTabPreview,
  useMailyContentPreview,
} from '../../hooks/useBroadcastEmailTabPreview';
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
  const { html, loading, error, device, setDevice } =
    useMailyContentPreview(content);

  if (error) {
    return <p className="text-sm text-destructive">{error.message}</p>;
  }

  if (loading) {
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
  const { t } = useTranslation('broadcasts');
  const { subject, fromLine, fromMemberIds, replyToLine, isMaily, content } =
    useBroadcastEmailTabPreview(message);

  return (
    <div className="flex flex-col gap-8 h-full w-full">
      <div className="px-9 py-5 border rounded-md bg-muted space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {t('composer.subject')}:
          </span>{' '}
          <h3 className="line-clamp-1">{subject} </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {t('composer.from')}:
          </span>
          {fromLine ? (
            <span className="font-semibold">{fromLine}</span>
          ) : (
            <MembersInline
              memberIds={fromMemberIds}
              className="font-semibold"
            />
          )}
        </div>

        {replyToLine && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {t('composer.replyTo')}:
            </span>
            <span className="font-semibold">{replyToLine}</span>
          </div>
        )}
      </div>

      {isMaily ? (
        <MailyContentPreview content={content} />
      ) : (
        <LegacyBlockContentPreview content={content} />
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
