import { Button, RelativeDateDisplay, Sheet, cn } from 'erxes-ui';

import { HAS_ATTACHMENT } from '@/inbox/constants/messengerConstants';
import { MessageContent } from '@/inbox/conversation-messages/components/MessageContent';
import { MessageEmbeds } from '@/inbox/conversation-messages/components/MessageEmbeds';
import { MessagePoll } from '@/inbox/conversation-messages/components/MessagePoll';
import {
  DiscordEditedStatus,
  MESSAGE_ACTION_BAR_CLASS,
  ReactionLabel,
  aggregateReactions,
  getMessageBubbleClassName,
} from '@/inbox/conversation-messages/components/MessageItemHelpers';
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
import { IconMicrophone, IconPin } from '@tabler/icons-react';
import { useState } from 'react';
import { MessageActions } from '@/inbox/conversation-messages/components/MessageActions';
import { DiscordMessageActions } from '@/integrations/discord/components/DiscordMessageActions';
export { MessageDaySeparator };

const getReplyPreview = (content?: string) => {
  if (!content) return '';

  const withoutQuotedReply = content.replace(
    /^<blockquote><strong>Replying to<\/strong><br\s*\/?>[\s\S]*?<\/blockquote>/i,
    '',
  );
  const document = new DOMParser().parseFromString(
    withoutQuotedReply,
    'text/html',
  );

  return (document.body.textContent || '').replace(/\s+/g, ' ').trim();
};

// skipcq: JS-R1005 — many independent display branches (text / attachment /
export const MessageItem = () => {
  const [actionsOpen, setActionsOpen] = useState(false);
  const { previousMessage, ...message } = useConversationMessageContext();
  const { _id: conversationId, integration } = useConversationContext();
  const {
    _id,
    mid,
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
    messageKind,
    providerData,
    replyTo,
    reactions: messageReactions,
    deliveryStatus,
    expiresAt,
  } = message;

  const poll = extraData?.poll;
  const embeds = extraData?.embeds;
  const stickers = extraData?.stickers;
  const forwardedSnapshot = extraData?.forwardedSnapshot;
  const forwardedContentMatch = content?.match(
    /<blockquote><strong>Forwarded message<\/strong><br\s*\/?>[\s\S]*?<\/blockquote>/i,
  );

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

  const legacyReplyMatch = content?.match(
    /^<blockquote><strong>Replying to<\/strong><br\s*\/?>[\s\S]*?<\/blockquote>/i,
  );
  const legacyReplyPreview = legacyReplyMatch?.[0]
    .replace(/<[^<>]+>/g, ' ')
    .replace(/^\s*Replying to\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  const effectiveReplyTo = forwardedSnapshot
    ? undefined
    : (replyTo
        ? {
            ...replyTo,
            content: getReplyPreview(replyTo.content) || 'Attachment',
          }
        : undefined) ||
      (legacyReplyPreview
        ? { messageId: '', content: legacyReplyPreview }
        : undefined);
  const displayContent =
    botText ||
    (legacyReplyMatch ? content.replace(legacyReplyMatch[0], '') : content)
      ?.replace(forwardedContentMatch?.[0] || '', '')
      .trim();
  const postIntegrationKind =
    integration?.kind === IntegrationType.FACEBOOK_POST ||
    integration?.kind === IntegrationType.INSTAGRAM_POST
      ? integration.kind
      : undefined;
  const isPostConversation = Boolean(postIntegrationKind);
  const typedAttachments = isPostConversation
    ? attachments?.map((attachment) => ({
        ...attachment,
        type:
          !attachment.type || attachment.type === 'file'
            ? 'image'
            : attachment.type,
      }))
    : attachments;
  const displayAttachments =
    integration?.kind === IntegrationType.FACEBOOK_MESSENGER
      ? typedAttachments?.filter(
          (attachment, index, allAttachments) =>
            attachment.type !== 'sticker' ||
            !allAttachments.some(
              (candidate, candidateIndex) =>
                candidateIndex !== index &&
                candidate.url === attachment.url &&
                candidate.type?.startsWith('image'),
            ),
        )
      : typedAttachments;
  const socialShareAttachment = displayAttachments?.find(
    (attachment) =>
      attachment.type === 'share' ||
      attachment.type === 'ig_post' ||
      attachment.type === 'ig_reel',
  );
  const hasImageAttachments = Boolean(
    displayAttachments?.some((attachment) =>
      attachment.type?.startsWith('image'),
    ),
  );
  const isFacebookAttachmentPlaceholder =
    integration?.kind === IntegrationType.FACEBOOK_MESSENGER &&
    Boolean(displayAttachments?.length) &&
    [
      'Sent an image',
      'Sent a sticker',
      'Sent a video',
      'Voice message',
      'Sent a file',
      'Shared content',
    ].includes(displayContent || '');
  const isSocialSharePlaceholder =
    Boolean(socialShareAttachment) &&
    ['This message has an attachment', 'Shared content'].includes(
      displayContent || '',
    );
  const strippedFigureContent =
    hasImageAttachments && displayContent
      ? displayContent.replace(
          /<figure\b[^>]*data-url=["'][^"']+["'][^>]*>[\s\S]*?<\/figure>/gi,
          '',
        )
      : displayContent;
  const normalizedDisplayContent =
    isFacebookAttachmentPlaceholder || isSocialSharePlaceholder
      ? undefined
      : strippedFigureContent;

  const isDeleted =
    Boolean(extraData?.discordDeletedAt) ||
    messageKind === 'deleted' ||
    deliveryStatus === 'deleted';
  const hasTextBubble =
    !isDeleted &&
    Boolean(normalizedDisplayContent) &&
    normalizedDisplayContent !== HAS_ATTACHMENT;
  const additionalActions = extraData?.discordMessageId ? (
    <DiscordMessageActions
      conversationId={message.conversationId || ''}
      messageId={extraData.discordMessageId}
      content={hasTextBubble ? normalizedDisplayContent : undefined}
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

  const isStory =
    messageKind === 'story_mention' || messageKind === 'story_reply';
  const fallbackText = providerData?.fallbackReason;
  const reactions = messageReactions?.length
    ? messageReactions
    : extraData?.reactions;
  const aggregatedReactions = aggregateReactions(reactions);

  const hasRenderableContent =
    isDeleted ||
    hasTextBubble ||
    Boolean(attachments?.length) ||
    Boolean(poll) ||
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
      >
        <div
          id={`conversation-message-${_id}`}
          data-provider-message-id={
            providerData?.messageId || extraData?.discordMessageId || mid
          }
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
            <span
              aria-label="Pinned message"
              title="Pinned message"
              className={cn(
                'absolute -top-2 z-20 inline-flex size-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-md',
                userId ? '-right-2' : '-left-2',
              )}
            >
              <IconPin className="size-3.5" />
            </span>
          )}
          {!isDeleted && (
            <Sheet open={actionsOpen} onOpenChange={setActionsOpen}>
              <Sheet.View
                side="bottom"
                className="rounded-t-2xl rounded-b-none bg-background px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] [@media(hover:hover)]:hidden"
              >
                <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
                <div className="mb-3 text-sm font-semibold">
                  Message actions
                </div>
                <div className="flex min-h-12 items-center justify-center gap-1 rounded-xl border bg-muted/35 p-2">
                  <MessageActions
                    message={message}
                    additionalActions={additionalActions}
                  />
                </div>
              </Sheet.View>
            </Sheet>
          )}
          {isDeleted && (
            <div
              className={cn(
                'mt-2 rounded-md border border-dashed px-3 py-2 text-sm italic text-muted-foreground',
                separatePrevious &&
                  (showAuthorName || showBotName ? 'mt-0' : 'mt-8'),
              )}
            >
              Message deleted
              {separateNext && (
                <div className="mt-1 text-xs not-italic">
                  <RelativeDateDisplay value={createdAt}>
                    <RelativeDateDisplay.Value value={createdAt} />
                  </RelativeDateDisplay>
                </div>
              )}
            </div>
          )}
          {effectiveReplyTo && !isDeleted && (
            <button
              type="button"
              onClick={() => {
                if (!effectiveReplyTo.messageId) return;
                const target =
                  document.querySelector<HTMLElement>(
                    `[data-provider-message-id="${CSS.escape(
                      effectiveReplyTo.messageId,
                    )}"]`,
                  ) ||
                  document.getElementById(
                    `conversation-message-${effectiveReplyTo.messageId}`,
                  );
                target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                target?.animate(
                  [
                    { backgroundColor: 'transparent' },
                    { backgroundColor: 'hsl(var(--accent))' },
                    { backgroundColor: 'transparent' },
                  ],
                  { duration: 900 },
                );
                if (!target) {
                  window.dispatchEvent(
                    new CustomEvent('frontline:jump-to-message', {
                      detail: effectiveReplyTo.messageId,
                    }),
                  );
                }
              }}
              className="mt-2 block w-full max-w-full rounded-t-xl border border-b-0 border-border/60 bg-muted/45 px-3.5 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-muted/70"
            >
              <div className="font-medium text-foreground">
                {effectiveReplyTo.authorName
                  ? `Replying to ${effectiveReplyTo.authorName}`
                  : 'Replying to a message'}
              </div>
              <div className="truncate">
                {effectiveReplyTo.content || effectiveReplyTo.messageId}
              </div>
            </button>
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
                hasReply: Boolean(effectiveReplyTo),
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
            !forwardedSnapshot && (
              <div className={cn(separatePrevious ? 'mt-6' : 'mt-1')} />
            )
          )}
          {/* skipcq: JS-0357 */}
          {!isDeleted && isStory && (
            <StoryCard
              kind={messageKind}
              url={providerData?.storyUrl || displayAttachments?.[0]?.url}
              expiresAt={expiresAt}
              fallbackText={fallbackText}
              mediaType={displayAttachments?.[0]?.type}
            />
          )}
          {!isDeleted && (messageKind === 'share' || socialShareAttachment) && (
            <ShareCard
              url={socialShareAttachment?.url || displayAttachments?.[0]?.url}
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
          {!isDeleted && extraData?.voiceMessage && (
            <div className="mt-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <IconMicrophone className="size-3.5" /> Voice message
            </div>
          )}
          {!isDeleted &&
            !hasTextBubble &&
            !isStory &&
            !socialShareAttachment &&
            fallbackText && <UnsupportedMessage text={fallbackText} />}
          {!isDeleted && poll && <MessagePoll poll={poll} />}
          {!isDeleted && <MessageEmbeds embeds={embeds} />}
          {!isDeleted && Boolean(aggregatedReactions.length) && (
            <div className="mt-1 flex flex-wrap gap-1">
              {aggregatedReactions.map((reaction) => (
                <span
                  key={reaction.label}
                  className="inline-flex h-7 items-center gap-0.5 rounded-full border border-border/70 bg-background px-2 text-xs shadow-xs transition-colors hover:bg-muted"
                >
                  <ReactionLabel label={reaction.label} />
                  {reaction.count > 1 && (
                    <span className="ml-1 text-muted-foreground">
                      {reaction.count}
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}
          {!isDeleted &&
            !hasTextBubble &&
            separateNext &&
            (Boolean(displayAttachments?.length) ||
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
