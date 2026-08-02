import { EmailSenderScopeProvider } from '@/settings/mail-config/contexts/EmailSenderScope';
import { useSenderOptions } from '@/settings/mail-config/hooks/useVerifiedSenders';
import { BlockEditor, useBlockEditor } from 'erxes-ui';
import { useEffect } from 'react';
import { MembersInline } from 'ui-modules';

const EmailPreview = ({ message }: { message: any }) => {
  const { fromEmail, fromUserId, email } = message || {};
  const { sender, subject, content, replyTo } = email || {};
  const { alignedFrom } = useSenderOptions();
  const editor = useBlockEditor();

  useEffect(() => {
    const loadInitialContent = async () => {
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
          {/* Shows what recipients actually see. Where the send path rewrites
              the From, the picked address is the reply destination, and naming
              it here would claim a sender the message never had. */}
          {alignedFrom ? (
            <span className="font-semibold">
              {sender} &lt;{alignedFrom}&gt;
            </span>
          ) : fromEmail ? (
            <span className="font-semibold">
              {sender ? `${sender} <${fromEmail}>` : fromEmail}
            </span>
          ) : (
            /* Campaigns created before senders were pickable only carry a user. */
            <MembersInline memberIds={[fromUserId]} className="font-semibold" />
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
  message: any;
}) => (
  <EmailSenderScopeProvider scope="broadcast">
    <EmailPreview message={message} />
  </EmailSenderScopeProvider>
);
