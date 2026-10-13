import { TelegramMessageContent } from '@/integrations/telegram/TelegramMessageContent';
import { Button, RelativeDateDisplay } from 'erxes-ui';
import { MessageContent } from '@/inbox/conversation-messages/components/MessageContent';
import {
  DiscordEditedStatus,
  getMessageBubbleClassName,
} from '@/inbox/conversation-messages/components/MessageItemHelpers';
import { DeliveryStatus } from '@/inbox/conversation-messages/components/messages/MessageStatus';
import type { MessagePresentationState } from '@/inbox/conversation-messages/types/MessagePresentation';
export const MessageTextBubble = ({
  presentation,
}: {
  presentation: MessagePresentationState;
}) => {
  const {
    message,
    isTelegram,
    normalizedDisplayContent,
    showAuthorName,
    showBotName,
    effectiveReplyTo,
    isForwardedMessage,
  } = presentation;
  const {
    userId,
    internal,
    fromBot,
    isBotMessage,
    separatePrevious,
    separateNext,
    createdAt,
    deliveryStatus,
    extraData,
  } = message;
  return (
    <Button
      variant="secondary"
      className={getMessageBubbleClassName({
        userId,
        internal,
        fromBot,
        isBotMessage,
        separatePrevious,
        showAuthorName,
        showBotName,
        hasReply: Boolean(effectiveReplyTo || isForwardedMessage),
      })}
      asChild
    >
      <div>
        {isTelegram && !internal ? (
          <TelegramMessageContent content={normalizedDisplayContent || ''} />
        ) : (
          <MessageContent
            content={normalizedDisplayContent}
            internal={internal}
          />
        )}
        {separateNext && (
          <div className="text-muted-foreground mt-1 flex items-center gap-1">
            <RelativeDateDisplay value={createdAt}>
              <RelativeDateDisplay.Value value={createdAt} />
            </RelativeDateDisplay>
            <DeliveryStatus status={userId ? deliveryStatus : undefined} />
            <DiscordEditedStatus edited={Boolean(extraData?.discordEditedAt)} />
          </div>
        )}
      </div>
    </Button>
  );
};
