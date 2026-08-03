import { EmailSenderScopeProvider } from '@/settings/mail-config/contexts/EmailSenderScope';
import { useSenderOptions } from '@/settings/mail-config/hooks/useVerifiedSenders';
import { BlockEditor, useBlockEditor } from 'erxes-ui';
import { useEffect } from 'react';
import { MembersInline } from 'ui-modules';

type TEmailPreviewMessage = {
  fromEmail?: string;
  fromUserId?: string;
  email?: {
    sender?: string;
    subject?: string;
    content?: string;
    replyTo?: string;
  };
};

const EmailPreview = ({ message }: { message?: TEmailPreviewMessage }) => {
  const { fromEmail, fromUserId, email } = message || {};
  const { sender, subject, content, replyTo } = email || {};
  const { alignedFrom } = useSenderOptions();
  const editor = useBlockEditor();

  useEffect(() => {
    const loadInitialContent = async () => {
      if (!content) {
        return;
      }

      let blocks;

      try {
        blocks = JSON.parse(content);
      } catch (_error) {
        blocks = await editor.tryParseHTMLToBlocks(content);
      }

      editor.replaceBlocks(editor.document, blocks);
    };

    loadInitialContent();
  }, [content, editor]);

  return (
    <div className="flex flex-col gap-8 h-full w-full">
      <div className="px-9 py-5 border rounded-md bg-muted space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Subject:</span>{' '}
          <h3 className="line-clamp-1">{subject} </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">From:</span>
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
            <span className="text-sm text-muted-foreground">Reply to:</span>
            <span className="font-semibold">
              {alignedFrom ? fromEmail : replyTo}
            </span>
          </div>
        )}
      </div>

      <BlockEditor
        editor={editor}
        readonly
        className="select-none flex-1 w-full overflow-y-auto"
      />
    </div>
  );
};

export const BroadcastTabPreviewEmailContent = ({
  message,
}: {
  message?: TEmailPreviewMessage;
}) => (
  <EmailSenderScopeProvider scope="broadcast">
    <EmailPreview message={message} />
  </EmailSenderScopeProvider>
);
