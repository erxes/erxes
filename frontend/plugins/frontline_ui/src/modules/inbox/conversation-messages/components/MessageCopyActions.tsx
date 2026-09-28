import { CopyText, DropdownMenu, stripHtml } from 'erxes-ui';
import { IconCopy } from '@tabler/icons-react';
import { CopyAttachmentAction } from '@/inbox/conversation-messages/components/CopyAttachmentAction';
import { MessageCopyAction } from '@/inbox/conversation-messages/components/MessageCopyAction';
import { HAS_ATTACHMENT } from '@/inbox/constants/messengerConstants';
import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { useConversationMessageContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationMessageContext';
import { IntegrationType } from '@/types/Integration';

export const MessageCopyActions = ({ inline }: { inline: boolean }) => {
  const message = useConversationMessageContext();
  const { _id: conversationId, integration } = useConversationContext();
  const isInstagram = integration?.kind === IntegrationType.INSTAGRAM_MESSENGER;
  const contentText = stripHtml(message.content).trim();
  const text =
    contentText === HAS_ATTACHMENT || contentText === 'Shared content'
      ? ''
      : contentText;

  if (isInstagram) {
    const imageAttachment = message.attachments?.find(
      (attachment) =>
        attachment.type?.startsWith('image') || attachment.type === 'sticker',
    );
    return (
      <MessageCopyAction
        text={text}
        attachment={imageAttachment}
        conversationId={conversationId}
        messageId={message._id}
        isInstagram
        inline={inline}
      />
    );
  }

  return (
    <>
      {message.attachments?.map((attachment, index) => (
        <CopyAttachmentAction
          key={`${attachment.url}-${index}`}
          attachment={attachment}
          inline={inline}
        />
      ))}
      {text &&
        (inline ? (
          <CopyText
            value={text}
            className="size-8 justify-center rounded-md text-muted-foreground hover:bg-muted [&>span]:gap-0 [&>span]:text-[0px]"
          >
            <IconCopy className="size-4" />
            <span className="sr-only">Copy text</span>
          </CopyText>
        ) : (
          <DropdownMenu.Item asChild className="rounded-lg">
            <CopyText value={text} className="w-full">
              <IconCopy className="size-4" />
              Copy text
            </CopyText>
          </DropdownMenu.Item>
        ))}
    </>
  );
};
