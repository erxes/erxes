import { useMessagePresentation } from '@/inbox/conversation-messages/hooks/useMessagePresentation';
import { MessageTextBubble } from '@/inbox/conversation-messages/components/messages/MessageTextBubble';
import { Button, RelativeDateDisplay, cn } from 'erxes-ui';
import { MessageEmbeds } from '@/inbox/conversation-messages/components/MessageEmbeds';
import { MessagePoll } from '@/inbox/conversation-messages/components/MessagePoll';
import { MessageSurvey } from '@/inbox/conversation-messages/components/MessageSurvey';
import {
  DiscordEditedStatus,
  getMessageBubbleClassName,
} from '@/inbox/conversation-messages/components/MessageItemHelpers';
import { MESSAGE_ACTION_BAR_CLASS } from '@/inbox/conversation-messages/constants/messageActions';
import { getProviderMessageId } from '@/inbox/conversation-messages/utils/message';
import { Attachments } from '@/inbox/conversation-messages/components/MessageAttachments';
import {
  DeliveryStatus,
  MessageDaySeparator,
  UnsupportedMessage,
} from '@/inbox/conversation-messages/components/messages/MessageStatus';
import { ForwardedMessageCard } from '@/inbox/conversation-messages/components/cards/ForwardedMessageCard';
import { PostMediaCard } from '@/inbox/conversation-messages/components/cards/PostMediaCard';
import {
  ShareCard,
  StoryCard,
} from '@/inbox/conversation-messages/components/cards/SocialCards';
import { StickerCard } from '@/inbox/conversation-messages/components/stickers/StickerCard';
import { MessageWrapper } from '@/inbox/conversation-messages/components/MessageWrapper';
import { FormWidgetMessage } from '@/inbox/conversation-messages/components/FormWidgetMessage';
import { MessageAuthorHeader } from '@/inbox/conversation-messages/components/MessageAuthorHeader';
import { IconDots } from '@tabler/icons-react';
import { useState } from 'react';
import { MessageActions } from '@/inbox/conversation-messages/components/MessageActions';
import { DiscordMessageActions } from '@/integrations/discord/components/DiscordMessageActions';
import {
  DeletedMessage,
  MessageForwardedIndicator,
  MessageMobileActions,
  MessagePinnedIndicator,
  MessageReactions,
  MessageReplyPreview,
  VoiceMessageLabel,
} from '@/inbox/conversation-messages/components/MessageItemDetails';

export const MessageItem = () => {
  const [actionsOpen, setActionsOpen] = useState(false);
  const presentation = useMessagePresentation();
  const {
    message,
    previousMessage,
    conversationId,
    integration,
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
    isDeleted,
    hasTextBubble,
    showAuthorName,
    showBotName,
    emptyMessageSpacing,
    isStory,
    fallbackText,
    hasRenderableContent,
  } = presentation;
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
    isBotMessage,
    messageKind,
    providerData,
    deliveryStatus,
    expiresAt,
  } = message;

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
      <MessageWrapper
        actions={
          !isDeleted ? (
            <>
              <div className={MESSAGE_ACTION_BAR_CLASS}>
                <MessageActions additionalActions={additionalActions} />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 rounded-full bg-background shadow-sm md:hidden"
                aria-label="Message actions"
                onClick={() => setActionsOpen(true)}
              >
                <IconDots className="size-4" />
              </Button>
            </>
          ) : undefined
        }
        below={!isDeleted ? <MessageReactions /> : undefined}
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
            <MessageTextBubble presentation={presentation} />
          ) : (
            !isDeleted &&
            !forwardedSnapshot &&
            !attachments?.length && <div className={cn(emptyMessageSpacing)} />
          )}
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
              {stickers?.map((sticker) => (
                <StickerCard key={sticker.id} sticker={sticker} />
              ))}
            </div>
          )}
          {!isDeleted && forwardedSnapshot && (
            <>
              <MessageForwardedIndicator />
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
                  hasReply: true,
                })}
              />
            </>
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
