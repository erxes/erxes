import { useAtomValue } from 'jotai';
import {
  Avatar,
  Button,
  Dialog,
  IAttachment,
  RelativeDateDisplay,
  cn,
  formatBytes,
  readImage,
} from 'erxes-ui';
import { CustomersInline, MembersInline } from 'ui-modules';

import { HAS_ATTACHMENT } from '@/inbox/constants/messengerConstants';
import { ConversationFormDisplay } from '@/inbox/conversation-messages/components/ConversationFormDisplay';
import { MessageContent } from '@/inbox/conversation-messages/components/MessageContent';
import { MessageEmbeds } from '@/inbox/conversation-messages/components/MessageEmbeds';
import { MessagePoll } from '@/inbox/conversation-messages/components/MessagePoll';
import { useConversationMessageContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationMessageContext';
import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { activeConversationState } from '@/inbox/conversations/states/activeConversationState';
import { IntegrationType } from '@/types/Integration';
import {
  IconBrain,
  IconExternalLink,
  IconFile,
  IconPhotoOff,
  IconPin,
  IconPlayerPlay,
  IconSparkles,
  IconMicrophone,
  IconShare3,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { isSameDay } from 'date-fns';
import { MessageActions } from './MessageActions';
import { DiscordMessageActions } from '@/integrations/discord/components/DiscordMessageActions';
import type {
  IMessageForwardedSnapshot,
  IMessageSticker,
} from '@/inbox/types/Conversation';

const Img = ({
  alt,
  ...props
}: Omit<JSX.IntrinsicElements['img'], 'alt'> & { alt: string }) => (
  // skipcq: JS-W1015
  <img alt={alt} {...props} />
);

const REACTION_EMOJI: Record<string, string> = {
  love: '❤️',
  like: '👍',
  wow: '😮',
  haha: '😂',
  sad: '😢',
  angry: '😠',
};

const aggregateReactions = (
  reactions?: Array<{ senderId: string; emoji?: string; reaction?: string }>,
) => {
  const counts = new Map<string, number>();
  for (const reaction of reactions || []) {
    const label =
      reaction.emoji ||
      REACTION_EMOJI[reaction.reaction || ''] ||
      reaction.reaction ||
      '♥';
    counts.set(label, (counts.get(label) || 0) + 1);
  }
  return [...counts.entries()].map(([label, count]) => ({ label, count }));
};

const ReactionLabel = ({ label }: { label: string }) => {
  const customEmoji = /^<(a?):[^:]+:(\d+)>$/.exec(label);
  if (!customEmoji) return <>{label}</>;
  const [, animated, id] = customEmoji;
  return (
    <Img
      src={`https://cdn.discordapp.com/emojis/${id}.${
        animated ? 'gif' : 'png'
      }`}
      alt="Custom emoji"
      className="inline-block size-4 object-contain"
    />
  );
};

const getMessageBubbleClassName = ({
  userId,
  internal,
  fromBot,
  isBotMessage,
  separatePrevious,
  showAuthorName,
  showBotName,
  hasReply,
}: {
  userId?: string;
  internal?: boolean;
  fromBot?: boolean;
  isBotMessage?: boolean;
  separatePrevious: boolean;
  showAuthorName: boolean;
  showBotName: boolean;
  hasReply: boolean;
}) =>
  cn(
    'mt-1.5 block h-auto min-h-0 rounded-2xl border border-transparent px-3.5 py-2.5 text-left font-normal shadow-[0_1px_2px_rgba(15,23,42,0.06)] **:whitespace-pre-wrap space-y-1.5 overflow-x-hidden text-pretty wrap-break-word [&_a]:text-primary [&_a]:underline [&_img]:aspect-square [&_img]:object-cover [&_img]:rounded-xl',
    userId &&
      'rounded-br-md border-primary/10 bg-primary/10 hover:bg-primary/10',
    !userId &&
      'rounded-bl-md border-border/60 bg-background hover:bg-background',
    isBotMessage && 'border-border/60 bg-muted hover:bg-muted',
    internal && 'bg-warning/20 hover:bg-warning/5',
    fromBot && 'bg-primary/5 hover:bg-primary/5 border-l-2 border-primary',
    separatePrevious &&
      !hasReply &&
      (showAuthorName || showBotName ? 'mt-0' : 'mt-6'),
    hasReply && 'mt-0 rounded-t-md',
  );

// skipcq: JS-R1005 — many independent display branches (text / attachment /
export const MessageItem = () => {
  const { previousMessage, ...message } = useConversationMessageContext();
  const { integration } = useConversationContext();
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
  const hasImageAttachments = Boolean(
    attachments?.some((attachment) => attachment.type?.startsWith('image')),
  );
  const normalizedDisplayContent = hasImageAttachments
    ? displayContent?.replace(
        /<figure\b[^>]*data-url=["'][^"']+["'][^>]*>[\s\S]*?<\/figure>/gi,
        '',
      )
    : displayContent;

  if (formWidgetData)
    return (
      // skipcq: JS-0357
      <MessageWrapper>
        <ConversationFormDisplay {...message} />
      </MessageWrapper>
    );

  const showAuthorName = Boolean(
    (isGroupConversation ||
      integration?.kind === IntegrationType.DISCORD_MESSENGER) &&
      !userId &&
      customerId &&
      separatePrevious,
  );

  const showBotName = Boolean(fromBot) && separatePrevious;

  const isDeleted =
    Boolean(extraData?.discordDeletedAt) ||
    messageKind === 'deleted' ||
    deliveryStatus === 'deleted';
  const isStory =
    messageKind === 'story_mention' || messageKind === 'story_reply';
  const fallbackText = providerData?.fallbackReason;
  const reactions = messageReactions || extraData?.reactions;
  const aggregatedReactions = aggregateReactions(reactions);

  const hasTextBubble =
    !isDeleted &&
    Boolean(normalizedDisplayContent) &&
    normalizedDisplayContent !== HAS_ATTACHMENT;

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
      {showAuthorName && (
        <div className="pl-11 pt-4 pb-0.5 text-xs font-medium text-muted-foreground">
          <CustomersInline
            customerIds={customerId ? [customerId] : []}
            hideAvatar
          />
        </div>
      )}
      {showBotName && (
        <div className="pl-11 pt-4 pb-0.5 flex items-center gap-1 text-xs font-medium text-primary">
          <IconSparkles className="size-3.5" />
          AI Agent
        </div>
      )}
      {/* skipcq: JS-0357 */}
      <MessageWrapper>
        <div
          id={`conversation-message-${_id}`}
          data-provider-message-id={
            providerData?.messageId || extraData?.discordMessageId || mid
          }
          className="group relative min-w-0 max-w-[min(78vw,520px)]"
          key={_id}
        >
          {!isDeleted && (
            <div
              className={cn(
                'absolute top-0 z-30 -translate-y-[calc(100%-0.35rem)] opacity-100 transition-all duration-150 md:pointer-events-none md:translate-y-[calc(100%-0.15rem)] md:opacity-0 md:focus-within:pointer-events-auto md:focus-within:-translate-y-[calc(100%-0.35rem)] md:focus-within:opacity-100 md:group-hover:pointer-events-auto md:group-hover:-translate-y-[calc(100%-0.35rem)] md:group-hover:opacity-100',
                userId ? 'right-0' : 'left-0',
              )}
            >
              <div className="flex items-center gap-0.5 rounded-full border border-border/70 bg-background/95 px-1 py-0.5 shadow-lg shadow-black/5 backdrop-blur-md">
                <MessageActions message={message} />
                {extraData?.discordMessageId && (
                  <DiscordMessageActions
                    conversationId={message.conversationId || ''}
                    messageId={extraData.discordMessageId}
                    content={
                      hasTextBubble ? normalizedDisplayContent : undefined
                    }
                    isOwnMessage={Boolean(userId) || Boolean(fromBot)}
                  />
                )}
              </div>
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
          {replyTo?.messageId && !isDeleted && (
            <button
              type="button"
              onClick={() => {
                const target =
                  document.querySelector<HTMLElement>(
                    `[data-provider-message-id="${CSS.escape(
                      replyTo.messageId,
                    )}"]`,
                  ) ||
                  document.getElementById(
                    `conversation-message-${replyTo.messageId}`,
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
                      detail: replyTo.messageId,
                    }),
                  );
                }
              }}
              className="mt-2 block w-full max-w-full rounded-t-xl border border-b-0 border-border/60 bg-muted/45 px-3.5 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-muted/70"
            >
              <div className="font-medium text-foreground">
                {replyTo.authorName
                  ? `Replying to ${replyTo.authorName}`
                  : 'Replying to a message'}
              </div>
              <div className="truncate">
                {replyTo.content || replyTo.messageId}
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
                hasReply: Boolean(replyTo?.messageId),
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
                  </div>
                )}
              </div>
            </Button>
          ) : (
            !isDeleted && (
              <div className={cn(separatePrevious ? 'mt-6' : 'mt-1')} />
            )
          )}
          {/* skipcq: JS-0357 */}
          {!isDeleted && isStory && (
            <StoryCard
              kind={messageKind}
              url={providerData?.storyUrl || attachments?.[0]?.url}
              expiresAt={expiresAt}
              fallbackText={fallbackText}
            />
          )}
          {!isDeleted && messageKind === 'share' && (
            <ShareCard url={attachments?.[0]?.url} />
          )}
          {!isDeleted && !isStory && messageKind !== 'share' && (
            <Attachments attachments={attachments} />
          )}
          {!isDeleted && Boolean(stickers?.length) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {stickers?.map((sticker) => (
                <StickerCard key={sticker.id} sticker={sticker} />
              ))}
            </div>
          )}
          {!isDeleted && forwardedSnapshot && (
            <ForwardedMessageCard snapshot={forwardedSnapshot} />
          )}
          {!isDeleted && extraData?.voiceMessage && (
            <div className="mt-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <IconMicrophone className="size-3.5" /> Voice message
            </div>
          )}
          {!isDeleted && !hasTextBubble && !isStory && fallbackText && (
            <UnsupportedMessage text={fallbackText} />
          )}
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
          {!isDeleted && extraData?.discordPinned && (
            <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <IconPin className="size-3" /> Pinned
            </div>
          )}
          {!isDeleted && extraData?.discordEditedAt && (
            <div className="mt-1 text-[11px] text-muted-foreground/80">
              Edited
            </div>
          )}
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
                <DeliveryStatus status={userId ? deliveryStatus : undefined} />
              </div>
            )}
        </div>
      </MessageWrapper>
    </>
  );
};

export const MessageDaySeparator = ({
  createdAt,
  previousCreatedAt,
}: {
  createdAt: string;
  previousCreatedAt?: string;
}) => {
  if (
    previousCreatedAt &&
    isSameDay(new Date(previousCreatedAt), new Date(createdAt))
  ) {
    return null;
  }
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
      <div className="h-px flex-1 bg-border" />
      <time dateTime={createdAt}>
        {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
          new Date(createdAt),
        )}
      </time>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
};

const DeliveryStatus = ({ status }: { status?: string }) => {
  if (!status || status === 'deleted') return null;
  return <span aria-label={`Message ${status}`}>· {status}</span>;
};

const UnsupportedMessage = ({ text }: { text: string }) => (
  <div className="mt-2 flex items-center gap-2 rounded-md border border-dashed bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
    <IconPhotoOff className="size-4 shrink-0" />
    <span>{text}</span>
  </div>
);

const StoryCard = ({
  kind,
  url,
  expiresAt,
  fallbackText,
}: {
  kind?: string;
  url?: string;
  expiresAt?: string;
  fallbackText?: string;
}) => {
  const [failed, setFailed] = useState(false);
  const [expired, setExpired] = useState(
    Boolean(expiresAt && new Date(expiresAt) <= new Date()),
  );
  useEffect(() => {
    if (!expiresAt) return;
    const remaining = new Date(expiresAt).getTime() - Date.now();
    if (remaining <= 0) {
      setExpired(true);
      return;
    }
    const timeout = window.setTimeout(
      () => setExpired(true),
      Math.min(remaining, 2_147_483_647),
    );
    return () => window.clearTimeout(timeout);
  }, [expiresAt]);
  const unavailable = expired || failed || !url;
  const label = kind === 'story_reply' ? 'Story reply' : 'Story mention';

  if (unavailable) {
    return (
      <UnsupportedMessage
        text={
          expired ? `${label} expired` : fallbackText || 'Story unavailable'
        }
      />
    );
  }

  return (
    <div className="mt-2 overflow-hidden rounded-xl border bg-background">
      <div className="flex items-center gap-2 border-b px-3 py-2 text-xs font-medium">
        <IconPlayerPlay className="size-4" />
        {label}
      </div>
      <Img
        src={url}
        alt={label}
        loading="lazy"
        onError={() => setFailed(true)}
        className="max-h-96 w-full object-contain"
      />
    </div>
  );
};

const ShareCard = ({ url }: { url?: string }) => {
  let safeUrl: string | undefined;
  try {
    safeUrl =
      url && ['http:', 'https:'].includes(new URL(url).protocol)
        ? url
        : undefined;
  } catch {
    safeUrl = undefined;
  }
  if (!safeUrl) return <UnsupportedMessage text="Shared content unavailable" />;
  return (
    <a
      href={safeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 flex items-center gap-3 rounded-lg border bg-background px-3 py-3 no-underline hover:bg-muted/50"
    >
      <IconExternalLink className="size-5 shrink-0 text-muted-foreground" />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-foreground">
          Shared content
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {safeUrl}
        </span>
      </span>
    </a>
  );
};

const StickerCard = ({ sticker }: { sticker: IMessageSticker }) => {
  const [failed, setFailed] = useState(false);

  if (!sticker.url || failed) {
    return <UnsupportedMessage text={`Sticker · ${sticker.name}`} />;
  }

  return (
    <div className="mt-1 max-w-48">
      <Img
        src={sticker.url}
        alt={sticker.name}
        loading="lazy"
        onError={() => setFailed(true)}
        className="max-h-48 max-w-48 object-contain"
      />
      <div className="mt-1 truncate text-xs text-muted-foreground">
        {sticker.name}
      </div>
    </div>
  );
};

const ForwardedMessageCard = ({
  snapshot,
}: {
  snapshot: IMessageForwardedSnapshot;
}) => (
  <div className="mt-2 overflow-hidden rounded-lg border-l-2 border-primary/60 bg-muted/60 px-3 py-2">
    <div className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
      <IconShare3 className="size-3.5" /> Forwarded message
    </div>
    {snapshot.content && (
      <MessageContent content={snapshot.content} internal={false} />
    )}
    <Attachments attachments={snapshot.attachments} />
    {Boolean(snapshot.stickers?.length) && (
      <div className="flex flex-wrap gap-2">
        {snapshot.stickers?.map((sticker) => (
          <StickerCard key={sticker.id} sticker={sticker} />
        ))}
      </div>
    )}
    <MessageEmbeds embeds={snapshot.embeds} />
    {!snapshot.content &&
      !snapshot.attachments?.length &&
      !snapshot.stickers?.length &&
      !snapshot.embeds?.length && (
        <UnsupportedMessage text="Forwarded message unavailable" />
      )}
  </div>
);

export const MessageWrapper = ({ children }: { children: React.ReactNode }) => {
  const {
    separateNext,
    customerId,
    userId,
    fromBot,
    formWidgetData,
    isGroupConversation,
    isBotMessage,
  } = useConversationMessageContext();
  const isOutgoing = !!userId || (isBotMessage && !isGroupConversation);
  const { customer } = useAtomValue(activeConversationState) || {};
  const inlineCustomers =
    !isGroupConversation && customer && customer._id === customerId
      ? [customer]
      : undefined;
  return (
    <div
      className={cn(
        'flex w-full items-end gap-2',
        isOutgoing ? 'justify-end' : 'justify-start',
        !separateNext && isOutgoing && 'pr-10',
        !separateNext && !isOutgoing && 'pl-10',
        formWidgetData && 'pb-4',
      )}
    >
      {!!customerId && separateNext && !isOutgoing && (
        <CustomersInline.Provider
          customerIds={[customerId]}
          customers={inlineCustomers}
        >
          <CustomersInline.Avatar size="xl" />
        </CustomersInline.Provider>
      )}
      {Boolean(fromBot) && !customerId && separateNext && (
        <Avatar size="xl">
          <Avatar.Fallback className="bg-primary/10 text-primary">
            <IconSparkles className="size-4" />
          </Avatar.Fallback>
        </Avatar>
      )}
      {children}

      {!!userId && separateNext && (
        <MembersInline.Provider memberIds={[userId]}>
          <MembersInline.Avatar size="xl" />
        </MembersInline.Provider>
      )}
      {isBotMessage && !fromBot && separateNext && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
          <IconBrain className="size-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

const Attachments = ({ attachments }: { attachments?: IAttachment[] }) => {
  if (!attachments?.length) {
    return null;
  }

  const single = attachments.length === 1;

  return (
    <div
      className={cn(
        single ? 'flex' : 'grid grid-cols-6 gap-1.5 overflow-hidden rounded-lg',
      )}
    >
      {attachments.map((attachment, index) => (
        <div
          key={`${attachment.url}-${index}`}
          className={cn(
            !single && 'min-w-0',
            attachments.length === 2 && 'col-span-3',
            attachments.length === 3 &&
              (index < 2 ? 'col-span-3' : 'col-span-6 max-h-52'),
            attachments.length === 4 && 'col-span-3',
            attachments.length === 5 &&
              (index < 2 ? 'col-span-3' : 'col-span-2'),
            attachments.length > 5 && 'col-span-2',
          )}
        >
          <Attachment attachment={attachment} length={attachments.length} />
        </div>
      ))}
    </div>
  );
};

const Attachment = ({
  attachment,
  length,
}: {
  attachment: IAttachment;
  length?: number;
}) => {
  const [failed, setFailed] = useState(false);
  const type = attachment.type || '';
  const isImage = type.startsWith('image');
  const isVideo = type.startsWith('video');
  const isAudio = type.startsWith('audio');
  const single = length === 1;
  if (!attachment.url || failed) {
    return <UnsupportedMessage text="Attachment unavailable" />;
  }
  if (isVideo) {
    return (
      <video
        src={readImage(attachment.url)}
        controls
        preload="metadata"
        onError={() => setFailed(true)}
        className="size-full max-h-96 rounded bg-black object-contain"
      />
    );
  }
  if (isAudio) {
    return (
      <audio
        src={readImage(attachment.url)}
        controls
        preload="metadata"
        onError={() => setFailed(true)}
        className="w-full min-w-64"
      />
    );
  }
  if (!isImage) {
    return (
      <a
        href={readImage(attachment.url)}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          {
            'col-span-2': length === 1,
            'col-span-1': length !== 1,
          },
          'flex h-full w-full cursor-pointer items-center gap-3 rounded bg-accent px-3 py-2 no-underline hover:bg-accent/70',
        )}
      >
        <IconFile className="size-8 shrink-0 text-muted-foreground" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-primary">
            {attachment.name || 'File'}
          </span>
          {Boolean(attachment.size) && (
            <span className="text-xs text-muted-foreground">
              {formatBytes(attachment.size)}
            </span>
          )}
        </div>
      </a>
    );
  }
  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className={cn(
            'overflow-hidden rounded bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
            single ? 'w-fit max-w-full' : 'aspect-square size-full',
          )}
        >
          <Img
            src={readImage(attachment.url)}
            alt={attachment.name}
            loading="lazy"
            onError={() => setFailed(true)}
            className={cn(
              single
                ? 'block max-h-96 max-w-full object-contain'
                : 'size-full object-cover',
            )}
          />
        </button>
      </Dialog.Trigger>
      <Dialog.Content className="!flex !h-auto !max-h-[92vh] !w-auto !max-w-[94vw] items-center justify-center !overflow-hidden !border-0 !bg-black/90 !p-2 shadow-2xl [&>button]:bg-white/10 [&>button]:text-white [&>button]:hover:bg-white/20">
        <Img
          src={readImage(attachment.url)}
          alt={attachment.name}
          className="block h-auto max-h-[88vh] w-auto max-w-[90vw] rounded-lg object-contain"
        />
      </Dialog.Content>
    </Dialog>
  );
};
