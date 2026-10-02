import { stripHtml } from 'erxes-ui';
import { CopyAttachmentAction } from '@/inbox/conversation-messages/components/CopyAttachmentAction';
import { CopyTextAction } from '@/inbox/conversation-messages/components/CopyTextAction';
import { MessageCopyAction } from '@/inbox/conversation-messages/components/MessageCopyAction';
import { ATTACHMENT_PLACEHOLDER_TEXTS } from '@/inbox/constants/messengerConstants';
import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { useConversationMessageContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationMessageContext';
import { isImageAttachment } from '@/inbox/conversation-messages/utils/copyAttachment';
import { IntegrationType } from '@/types/Integration';

export const MessageCopyActions = ({ inline }: { inline: boolean }) => {
  const message = useConversationMessageContext();
  const { _id: conversationId, integration } = useConversationContext();
  const contentText = stripHtml(message.content).trim();
  const text = ATTACHMENT_PLACEHOLDER_TEXTS.has(contentText) ? '' : contentText;

  if (integration?.kind === IntegrationType.INSTAGRAM_MESSENGER) {
    return (
      <MessageCopyAction
        text={text}
        attachment={message.attachments?.find(isImageAttachment)}
        conversationId={conversationId}
        messageId={message._id}
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
      {text && <CopyTextAction text={text} inline={inline} />}
    </>
  );
};
