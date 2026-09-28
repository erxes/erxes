import { Message } from '../message';
import type { MessagePosition } from '../../types/message';
import { hasMessageContent } from '../../utils/quotedMessage';
import type { IAttachment } from '../../types';

export function OperatorMessage({
  content,
  src,
  createdAt,
  showAvatar = true,
  isFirstMessage,
  isLastMessage,
  isMiddleMessage,
  isSingleMessage,
  attachments,
  userName,
  onReply,
  onCopy,
}: {
  content: string;
  src?: string;
  createdAt: Date;
  showAvatar?: boolean;
  isFirstMessage?: boolean;
  isLastMessage?: boolean;
  isMiddleMessage?: boolean;
  isSingleMessage?: boolean;
  attachments?: IAttachment[];
  userName?: string;
  onReply?: () => void;
  onCopy?: () => void | Promise<void>;
}) {
  // Group position travels as one object instead of four loose booleans.
  const position: MessagePosition = {
    isFirstMessage,
    isLastMessage,
    isMiddleMessage,
    isSingleMessage,
  };
  const hasContent = hasMessageContent(content);
  const hasAttachments = !!attachments?.length;

  return (
    <Message align="start">
      <Message.Row className="group/message relative">
        <Message.Avatar
          show={showAvatar}
          src={src || 'assets/user.webp'}
          alt={userName || 'Erxes'}
          className={showAvatar ? 'mb-5' : undefined}
        />
        <Message.Body align="start">
          {(isFirstMessage || isSingleMessage) && userName && (
            <Message.Author>{userName}</Message.Author>
          )}
          {hasContent && (
            <Message.Content
              variant="incoming"
              position={position}
              hasAttachments={hasAttachments}
              html={content}
            />
          )}
          <Message.Attachments attachments={attachments} align="start" />
          {(isLastMessage || isSingleMessage) && (
            <Message.Time align="start" date={createdAt} />
          )}
        </Message.Body>
        <Message.ItemActions onReply={onReply} onCopy={onCopy} />
      </Message.Row>
    </Message>
  );
}

export const CustomerMessage = ({
  content,
  createdAt,
  attachments,
  isFirstMessage,
  isLastMessage,
  isMiddleMessage,
  isSingleMessage,
  onReply,
  onCopy,
}: {
  content?: string;
  createdAt: Date;
  attachments?: IAttachment[];
  isFirstMessage?: boolean;
  isLastMessage?: boolean;
  isMiddleMessage?: boolean;
  isSingleMessage?: boolean;
  onReply?: () => void;
  onCopy?: () => void | Promise<void>;
}) => {
  const position: MessagePosition = {
    isFirstMessage,
    isLastMessage,
    isMiddleMessage,
    isSingleMessage,
  };
  const hasContent = hasMessageContent(content);
  const hasAttachments = !!attachments?.length;

  return (
    <Message align="end" className="group/message relative">
      <div className="flex items-center gap-1 flex-row-reverse">
        <Message.Body align="end">
          {hasContent && (
            <Message.Content
              variant="outgoing"
              position={position}
              hasAttachments={hasAttachments}
              html={content}
            />
          )}
          <Message.Attachments attachments={attachments} align="end" />
        </Message.Body>
        <Message.ItemActions align="end" onReply={onReply} onCopy={onCopy} />
      </div>
      {(isLastMessage || isSingleMessage) && (
        <Message.Time align="end" date={createdAt} />
      )}
    </Message>
  );
};
