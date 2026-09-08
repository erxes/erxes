import { useQuery } from '@apollo/client';
import { EmailSenderScopeProvider } from '@/settings/mail-config/contexts/EmailSenderScope';
import { useSenderOptions } from '@/settings/mail-config/hooks/useVerifiedSenders';
import {
  BlockEditor,
  EmailPreviewFrame,
  JSONContent,
  useBlockEditor,
} from 'erxes-ui';
import { useEffect } from 'react';
import { MembersInline } from 'ui-modules';
import { BROADCAST_RENDER_PREVIEW } from '../../graphql/queries';

type TEmailPreviewMessage = {
  fromEmail?: string;
  fromUserId?: string;
  email?: {
    sender?: string;
    subject?: string;
    content?: string;
    contentJson?: JSONContent;
    previewText?: string;
    replyTo?: string;
  };
};

const LegacyBlockContentPreview = ({ content }: { content: string }) => {
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
    <BlockEditor
      editor={editor}
      readonly
      className="select-none flex-1 w-full overflow-y-auto"
    />
  );
};

const MailyContentPreview = ({
  contentJson,
  previewText,
}: {
  contentJson: JSONContent;
  previewText?: string;
}) => {
  const { data, loading } = useQuery(BROADCAST_RENDER_PREVIEW, {
    variables: { contentJson, previewText },
  });

  if (loading) {
    return null;
  }

  return (
    <EmailPreviewFrame
      html={data?.engageMessageRenderPreview || ''}
      className="flex-1"
    />
  );
};

const EmailPreview = ({ message }: { message?: TEmailPreviewMessage }) => {
  const { fromEmail, fromUserId, email } = message || {};
  const { sender, subject, content, contentJson, previewText, replyTo } =
    email || {};
  const { alignedFrom } = useSenderOptions();

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

      {contentJson ? (
        <MailyContentPreview
          contentJson={contentJson}
          previewText={previewText}
        />
      ) : (
        <LegacyBlockContentPreview content={content || ''} />
      )}
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
