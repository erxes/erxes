import { Button, RelativeDateDisplay, cn, stripHtml } from 'erxes-ui';

import { HAS_ATTACHMENT } from '@/inbox/constants/messengerConstants';
import { MessageContent } from '@/inbox/conversation-messages/components/MessageContent';
import { MessageEmbeds } from '@/inbox/conversation-messages/components/MessageEmbeds';
import { MessagePoll } from '@/inbox/conversation-messages/components/MessagePoll';
import { MessageSurvey } from '@/inbox/conversation-messages/components/MessageSurvey';
import {
  DiscordEditedStatus,
  getMessageBubbleClassName,
} from '@/inbox/conversation-messages/components/MessageItemHelpers';
import { MESSAGE_ACTION_BAR_CLASS } from '@/inbox/conversation-messages/constants/messageActions';
import {
  aggregateReactions,
  getProviderMessageId,
  getReactionKey,
} from '@/inbox/conversation-messages/utils/message';
import { Attachments } from '@/inbox/conversation-messages/components/MessageAttachments';
import {
  DeliveryStatus,
  ForwardedMessageCard,
  MessageDaySeparator,
  PostMediaCard,
  ShareCard,
  StickerCard,
  StoryCard,
  UnsupportedMessage,
} from '@/inbox/conversation-messages/components/MessagePresentation';
import { MessageWrapper } from '@/inbox/conversation-messages/components/MessageWrapper';
import { FormWidgetMessage } from '@/inbox/conversation-messages/components/FormWidgetMessage';
import { MessageAuthorHeader } from '@/inbox/conversation-messages/components/MessageAuthorHeader';
import { useConversationMessageContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationMessageContext';
import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { IntegrationType } from '@/types/Integration';
import { useState } from 'react';
import { MessageActions } from '@/inbox/conversation-messages/components/MessageActions';
import { DiscordMessageActions } from '@/integrations/discord/components/DiscordMessageActions';
import type {
  IMessageReaction,
  IMessageSticker,
} from '@/inbox/types/Conversation';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { useMessageReaction } from '@/inbox/conversation-messages/hooks/useMessageReaction';
import { getMessageDisplay } from '@/inbox/conversation-messages/utils/messageDisplay';
import {
  DeletedMessage,
  MessageForwardedIndicator,
  MessageMobileActions,
  MessagePinnedIndicator,
  MessageReactions,
  MessageReplyPreview,
  VoiceMessageLabel,
} from '@/inbox/conversation-messages/components/MessageItemDetails';
export { MessageDaySeparator };

// skipcq: JS-R1005 — many independent display branches (text / attachment /
export const MessageItem = () => {
  const [actionsOpen, setActionsOpen] = useState(false);
  const currentUser = useAtomValue(currentUserState);
  const { toggleReaction, loading: reactionLoading } = useMessageReaction();
  const { previousMessage, ...message } = useConversationMessageContext();
  const { _id: conversationId, integration } = useConversationContext();
  const {
    _id,
    userId,
    customerId,
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
    messageKind,
    providerData,
    reactions: messageReactions,
    deliveryStatus,
    expiresAt,
  } = message;

  const {
    poll,
    survey,
    embeds,
    stickers,
    forwardedSnapshot,
    isForwardedMessage,
    effectiveReplyTo,
    postIntegrationKind,
    displayAttachments,
    socialShareAttachment,
    normalizedDisplayContent,
  } = getMessageDisplay({
    message,
    integrationKind: integration?.kind,
    isBotMessage,
  });
  const isDeleted =
    Boolean(extraData?.discordDeletedAt) ||
    messageKind === 'deleted' ||
    deliveryStatus === 'deleted';
  const hasTextBubble =
    !isDeleted &&
    Boolean(normalizedDisplayContent) &&
    normalizedDisplayContent !== HAS_ATTACHMENT &&
    Boolean(
      normalizedDisplayContent
        ? stripHtml(normalizedDisplayContent).replace(/\s/g, '')
        : '',
    );
  const discordActionContent = hasTextBubble
    ? normalizedDisplayContent
    : undefined;
  const additionalActions = extraData?.discordMessageId ? (
    <DiscordMessageActions
      conversationId={message.conversationId || ''}
      messageId={extraData.discordMessageId}
      content={discordActionContent}
      isOwnMessage={Boolean(userId) || Boolean(fromBot)}
    />
  ) : undefined;

  if (formWidgetData)
    return (
      <FormWidgetMessage
        message={message}
        isDeleted={isDeleted}
        additionalActions={additionalActions}
      />
    );

  const showAuthorName = Boolean(
    (isGroupConversation ||
      integration?.kind === IntegrationType.DISCORD_MESSENGER) &&
      !userId &&
      customerId &&
      separatePrevious,
  );

  const showBotName = Boolean(fromBot) && separatePrevious;
  const emptyMessageSpacing = separatePrevious ? 'mt-6' : 'mt-1';

  const isStory =
    messageKind === 'story_mention' || messageKind === 'story_reply';
  const fallbackText = providerData?.fallbackReason;
  const reactions = messageReactions?.length
    ? messageReactions
    : extraData?.reactions;
  const aggregatedReactions = aggregateReactions(reactions);
  const ownReaction = reactions?.find(
    (reaction: IMessageReaction) => reaction.senderId === currentUser?._id,
  );
  const ownReactionKey = ownReaction ? getReactionKey(ownReaction) : undefined;
  const providerMessageId = getProviderMessageId(message);

  const hasRenderableContent =
    isDeleted ||
    hasTextBubble ||
    Boolean(attachments?.length) ||
    messageKind === 'share' ||
    Boolean(extraData?.voiceMessage) ||
    Boolean(poll) ||
    Boolean(survey) ||
    Boolean(embeds?.length) ||
    Boolean(stickers?.length) ||
    Boolean(forwardedSnapshot) ||
    Boolean(fallbackText) ||
    isStory;

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
      <MessageWrapper
        actions={
          !isDeleted ? (
            <div className={MESSAGE_ACTION_BAR_CLASS}>
              <MessageActions
                message={message}
                additionalActions={additionalActions}
              />
            </div>
          ) : undefined
        }
        below={
          !isDeleted && aggregatedReactions.length ? (
            <MessageReactions
              reactions={aggregatedReactions}
              loading={reactionLoading}
              providerMessageId={providerMessageId}
              ownReactionKey={ownReactionKey}
              conversationId={conversationId}
              toggleReaction={toggleReaction}
            />
          ) : undefined
        }
      >
        <div
          id={`conversation-message-${_id}`}
          data-provider-message-id={getProviderMessageId(message)}
          onContextMenu={(event) => {
            if (window.matchMedia('(hover: none)').matches) {
              event.preventDefault();
              setActionsOpen(true);
            }
          }}
          className="relative w-fit min-w-0 max-w-full"
          key={_id}
        >
          {!isDeleted && extraData?.discordPinned && (
            <MessagePinnedIndicator userId={userId} />
          )}
          {!isDeleted && (
            <MessageMobileActions
              open={actionsOpen}
              onOpenChange={setActionsOpen}
              message={message}
              additionalActions={additionalActions}
            />
          )}
          {isDeleted && (
            <DeletedMessage
              createdAt={createdAt}
              integrationKind={integration?.kind}
              separatePrevious={separatePrevious}
              separateNext={separateNext}
              showAuthorName={showAuthorName}
              showBotName={showBotName}
            />
          )}
          {effectiveReplyTo && !isDeleted && (
            <MessageReplyPreview replyTo={effectiveReplyTo} />
          )}
          {isForwardedMessage && !isDeleted && <MessageForwardedIndicator />}
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
                hasReply: Boolean(effectiveReplyTo || isForwardedMessage),
              })}
              asChild
            >
              <div>
                <MessageContent
                  content={normalizedDisplayContent}
                  internal={internal}
                />
                {separateNext && (
                  <div className="text-muted-foreground mt-1 flex items-center gap-1">
                    <RelativeDateDisplay value={createdAt}>
                      <RelativeDateDisplay.Value value={createdAt} />
                    </RelativeDateDisplay>
                    <DeliveryStatus
                      status={userId ? deliveryStatus : undefined}
                    />
                    <DiscordEditedStatus
                      edited={Boolean(extraData?.discordEditedAt)}
                    />
                  </div>
                )}
              </div>
            </Button>
          ) : (
            !isDeleted &&
            !forwardedSnapshot &&
            !attachments?.length && <div className={cn(emptyMessageSpacing)} />
          )}
          {/* skipcq: JS-0357 */}
          {!isDeleted && isStory && (
            <StoryCard
              kind={messageKind}
              url={
                providerData?.storyUrl ||
                (providerData?.attachmentType !== 'share'
                  ? displayAttachments?.[0]?.url
                  : undefined)
              }
              sourceUrl={
                providerData?.attachmentType === 'share'
                  ? displayAttachments?.[0]?.url
                  : undefined
              }
              expiresAt={expiresAt}
              fallbackText={fallbackText}
              mediaType={displayAttachments?.[0]?.type}
            />
          )}
          {!isDeleted &&
            !isStory &&
            (messageKind === 'share' || socialShareAttachment) && (
              <ShareCard
                url={socialShareAttachment?.url || displayAttachments?.[0]?.url}
                title={
                  socialShareAttachment?.name || displayAttachments?.[0]?.name
                }
                previewUrl={providerData?.previewUrl}
                shareType={providerData?.shareType}
                attachmentType={
                  socialShareAttachment?.type || providerData?.attachmentType
                }
              />
            )}
          {!isDeleted &&
            !isStory &&
            messageKind !== 'share' &&
            !socialShareAttachment &&
            (postIntegrationKind && displayAttachments?.length ? (
              <PostMediaCard
                conversationId={conversationId}
                integrationKind={postIntegrationKind}
                fallbackUrl={displayAttachments[0]?.url}
              />
            ) : (
              <Attachments
                attachments={forwardedSnapshot ? undefined : displayAttachments}
              />
            ))}
          {!isDeleted && Boolean(stickers?.length) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {stickers?.map((sticker: IMessageSticker) => (
                <StickerCard key={sticker.id} sticker={sticker} />
              ))}
            </div>
          )}
          {!isDeleted && forwardedSnapshot && (
            <ForwardedMessageCard
              snapshot={forwardedSnapshot}
              className={getMessageBubbleClassName({
                userId,
                internal,
                fromBot,
                isBotMessage,
                separatePrevious,
                showAuthorName,
                showBotName,
                hasReply: Boolean(effectiveReplyTo),
              })}
            />
          )}
          {!isDeleted && extraData?.voiceMessage && <VoiceMessageLabel />}
          {!isDeleted &&
            !hasTextBubble &&
            !isStory &&
            !socialShareAttachment &&
            fallbackText && <UnsupportedMessage text={fallbackText} />}
          {!isDeleted && poll && <MessagePoll poll={poll} />}
          {!isDeleted && survey && <MessageSurvey survey={survey} />}
          {!isDeleted && <MessageEmbeds embeds={embeds} />}
          {!isDeleted &&
            !hasTextBubble &&
            separateNext &&
            (Boolean(displayAttachments?.length) ||
              Boolean(poll) ||
              Boolean(survey) ||
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
                <DeliveryStatus status={userId ? deliveryStatus : undefined} />
                <DiscordEditedStatus
                  edited={Boolean(extraData?.discordEditedAt)}
                />
              </div>
            )}
        </div>
      </MessageWrapper>
    </>
  );
};
