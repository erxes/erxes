import { Button, RelativeDateDisplay, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { HAS_ATTACHMENT } from '@/inbox/constants/messengerConstants';
import { ConversationFormDisplay } from '@/inbox/conversation-messages/components/ConversationFormDisplay';
import { MessageAttachments } from '@/inbox/conversation-messages/components/MessageAttachments';
import { MessageAuthorHeader } from '@/inbox/conversation-messages/components/MessageAuthorHeader';
import { MessageContent } from '@/inbox/conversation-messages/components/MessageContent';
import { MessageEmbeds } from '@/inbox/conversation-messages/components/MessageEmbeds';
import { getMessageBubbleClassName } from '@/inbox/conversation-messages/components/MessageItemHelpers';
import { MessagePoll } from '@/inbox/conversation-messages/components/MessagePoll';
import { MessageDaySeparator } from '@/inbox/conversation-messages/components/MessagePresentation';
import { MessageWrapper } from '@/inbox/conversation-messages/components/MessageWrapper';
import { useConversationMessageContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationMessageContext';
import { DiscordMessageActions } from '@/integrations/discord/components/DiscordMessageActions';

// skipcq: JS-R1005 — many independent display branches (text / attachment /
export const MessageItem = () => {
  const { t } = useTranslation('frontline');
  const { previousMessage, ...message } = useConversationMessageContext();
  const {
    _id,
    conversationId,
    userId,
    customerId,
    content,
    createdAt,
    attachments,
    formWidgetData,
    extraData,
    internal,
    fromBot,
    separatePrevious,
    separateNext,
    isGroupConversation,
    isBotMessage,
    botData,
  } = message;

  const poll = extraData?.poll;
  const embeds = extraData?.embeds;

  const botText =
    isBotMessage && botData?.length
      ? (botData as Array<{ type?: string; text?: string; content?: string }>)
          .filter(
            (item) =>
              item?.type !== 'quickReplies' && item?.type !== 'ticketForm',
          )
          .map((item) => item?.text || item?.content || '')
          .join('')
      : undefined;

  const displayContent = botText || content;

  if (formWidgetData)
    return (
      // skipcq: JS-0357
      <MessageWrapper>
        <ConversationFormDisplay {...message} />
      </MessageWrapper>
    );

  const showAuthorName = Boolean(
    isGroupConversation && !userId && customerId && separatePrevious,
  );

  const showBotName = Boolean(fromBot) && separatePrevious;

  const isDeleted = Boolean(extraData?.discordDeletedAt);

  const hasTextBubble =
    !isDeleted && Boolean(displayContent) && displayContent !== HAS_ATTACHMENT;

  const hasRenderableContent =
    isDeleted ||
    hasTextBubble ||
    Boolean(attachments?.length) ||
    Boolean(poll) ||
    Boolean(embeds?.length);

  if (!hasRenderableContent) {
    return null;
  }

  return (
    <>
      <MessageDaySeparator
        createdAt={createdAt}
        previousCreatedAt={previousMessage?.createdAt}
      />
      <MessageAuthorHeader
        customerId={showAuthorName ? customerId : undefined}
        showBotName={showBotName}
      />
      {/* skipcq: JS-0357 */}
      <MessageWrapper>
        <div
          className={cn(
            'w-fit min-w-0 max-w-full',
            extraData?.discordMessageId && 'group relative',
          )}
          key={_id}
        >
          {extraData?.discordMessageId && !isDeleted && (
            <div
              className={cn(
                'absolute bottom-0 z-10',
                userId ? 'right-full mr-1' : 'left-full ml-1',
              )}
            >
              <DiscordMessageActions
                conversationId={conversationId || ''}
                messageId={extraData.discordMessageId}
                content={hasTextBubble ? displayContent : undefined}
                isOwnMessage={Boolean(userId) || Boolean(fromBot)}
              />
            </div>
          )}
          {isDeleted && (
            <div
              className={cn(
                'mt-2 rounded-md border border-dashed px-3 py-2 text-sm italic text-muted-foreground',
                separatePrevious &&
                  (showAuthorName || showBotName ? 'mt-0' : 'mt-8'),
              )}
            >
              {t('message-deleted-on-discord', 'Message deleted on Discord')}
              {separateNext && (
                <div className="mt-1 text-xs not-italic">
                  <RelativeDateDisplay value={createdAt}>
                    <RelativeDateDisplay.Value value={createdAt} />
                  </RelativeDateDisplay>
                </div>
              )}
            </div>
          )}
          {hasTextBubble ? (
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
              })}
              asChild
            >
              <div>
                <MessageContent content={displayContent} internal={internal} />
                {separateNext && (
                  <div className="text-muted-foreground mt-1">
                    <RelativeDateDisplay value={createdAt}>
                      <RelativeDateDisplay.Value value={createdAt} />
                    </RelativeDateDisplay>
                  </div>
                )}
              </div>
            </Button>
          ) : (
            !isDeleted && (
              <div className={cn(separatePrevious ? 'mt-2' : 'mt-8')} />
            )
          )}
          {/* skipcq: JS-0357 */}
          {!isDeleted && <MessageAttachments attachments={attachments} />}
          {!isDeleted && poll && <MessagePoll poll={poll} />}
          {!isDeleted && <MessageEmbeds embeds={embeds} />}
          {!isDeleted &&
            !hasTextBubble &&
            separateNext &&
            (Boolean(attachments?.length) ||
              Boolean(poll) ||
              Boolean(embeds?.length)) && (
              <div
                className={cn(
                  'text-muted-foreground mt-1 text-xs',
                  userId ? 'text-right' : 'text-left',
                )}
              >
                <RelativeDateDisplay value={createdAt}>
                  <RelativeDateDisplay.Value value={createdAt} />
                </RelativeDateDisplay>
              </div>
            )}
        </div>
      </MessageWrapper>
    </>
  );
};
