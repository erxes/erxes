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
import { activeConversationState } from '@/inbox/conversations/states/activeConversationState';
import { IconBrain, IconFile, IconSparkles } from '@tabler/icons-react';

// erxes runs on Vite, not Next.js, so next/image (JS-W1015) doesn't apply here.
const Img = (props: JSX.IntrinsicElements['img']) => (
  // skipcq: JS-W1015
  <img {...props} />
);

// The text bubble's background/spacing depends on who sent it (own/internal
// note/bot) and whether an author/bot label already sits above it. Split out
// of the component's JSX so this branching isn't counted against it.
const getMessageBubbleClassName = ({
  userId,
  internal,
  fromBot,
  isBotMessage,
  separatePrevious,
  showAuthorName,
  showBotName,
}: {
  userId?: string;
  internal?: boolean;
  fromBot?: boolean;
  isBotMessage?: boolean;
  separatePrevious: boolean;
  showAuthorName: boolean;
  showBotName: boolean;
}) =>
  cn(
    'mt-2 h-auto py-2 text-left **:whitespace-pre-wrap block font-normal space-y-2 overflow-x-hidden text-pretty wrap-break-word [&_a]:text-primary [&_a]:underline [&_img]:aspect-square [&_img]:object-cover [&_img]:rounded',
    userId && 'bg-primary/10 hover:bg-primary/10',
    isBotMessage && 'bg-muted hover:bg-muted',
    internal && 'bg-warning/20 hover:bg-warning/5',
    fromBot && 'bg-primary/5 hover:bg-primary/5 border-l-2 border-primary',
    separatePrevious && (showAuthorName || showBotName ? 'mt-0' : 'mt-8'),
  );

// skipcq: JS-R1005 — many independent display branches (text / attachment /
// poll / embed / author / bot labels); flattening them reads clearer than
// splitting into helpers that each re-derive the same message fields.
export const MessageItem = () => {
  const { previousMessage, nextMessage, ...message } =
    useConversationMessageContext();
  const {
    _id,
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

  // A structured bot reply (e.g. quick-reply/ticket-form driven) carries its
  // readable text separately from its raw `content`; extract it for display,
  // skipping non-text parts. Falls back to plain `content` otherwise.
  const botText = isBotMessage && botData?.length
    ? (botData as Array<{ type?: string; text?: string; content?: string }>)
        .filter((item) => item?.type !== 'quickReplies' && item?.type !== 'ticketForm')
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

  // In a group conversation, label each customer's message cluster with its
  // author so multiple senders are distinguishable.
  const showAuthorName = Boolean(
    isGroupConversation && !userId && customerId && separatePrevious,
  );

  // Label an automation/AI reply so it reads as a bot answer, not a human one.
  const showBotName = Boolean(fromBot) && separatePrevious;

  // A text bubble carries its own timestamp; an attachment-only message (empty
  // content) renders just the file, so it needs the timestamp added separately.
  const hasTextBubble = Boolean(displayContent) && displayContent !== HAS_ATTACHMENT;

  // Nothing to render — no text, attachments, poll, or embeds. This happens for
  // system messages that slip through (e.g. a Discord member-join "just landed"
  // message stored before ingest-time filtering existed): skip it entirely so it
  // doesn't leave an empty bubble + author label in the thread.
  const hasRenderableContent =
    hasTextBubble ||
    Boolean(attachments?.length) ||
    Boolean(poll) ||
    Boolean(embeds?.length);

  if (!hasRenderableContent) {
    return null;
  }

  return (
    <>
      {showAuthorName && (
        <div className="pl-11 pt-4 pb-0.5 text-xs font-medium text-muted-foreground">
          <CustomersInline customerIds={customerId ? [customerId] : []} hideAvatar />
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
        <div className={cn('max-w-[428px]')} key={_id}>
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
          <div className={cn(separatePrevious ? 'mt-2' : 'mt-8')} />
        )}
          {/* skipcq: JS-0357 */}
          <Attachments attachments={attachments} />
          {poll && <MessagePoll poll={poll} />}
          <MessageEmbeds embeds={embeds} />
          {/* Attachment/poll/embed-only messages have no text bubble to host the
              timestamp, so show it under the content for the cluster's last
              message. */}
          {!hasTextBubble &&
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
  const isOutgoing = !!userId || isBotMessage;
  const { customer } = useAtomValue(activeConversationState) || {};
  // Resolve the avatar from the message's own customerId by passing `undefined`,
  // which lets the provider fetch by id. We only short-circuit with the
  // conversation's pre-loaded `customer` when it is actually this message's
  // author (saves a fetch in a single-customer inbox). The id guard is required
  // for Discord, where the conversation-level `customer` is not the author of
  // every message: passing it unconditionally pins every avatar/name to that one
  // customer (the provider ignores the per-id fetch once `customers` is set), so
  // messages render the wrong sender until `activeConversationState` is cleared
  // by a refresh. Never pass `[]`: that is treated as an already-resolved empty
  // set, so the avatar silently disappears.
  const inlineCustomers =
    !isGroupConversation && customer && customer._id === customerId
      ? [customer]
      : undefined;
  return (
    <div
      className={cn(
        'flex items-end w-full gap-3',
        isOutgoing ? 'justify-end' : 'justify-start',
        !separateNext && !isBotMessage && 'px-11',
        // Reserve the avatar column (size-8 + gap-3 = pl-11) for a customer's
        // non-last messages, which don't render an avatar, so every message in
        // a cluster lines up with the avatar'd one instead of jumping left.
        !separateNext && Boolean(customerId) && 'pl-11',
        !customerId && 'pl-11',
        !isOutgoing && 'pr-11',
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
      {/* AI/automation replies have no customer or user; give them their own
          bot avatar so they don't borrow a customer's identity. */}
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

  // A lone attachment renders at its natural width/aspect ratio; multiples
  // collapse into a uniform thumbnail grid.
  const single = attachments.length === 1;

  return (
    <div className={cn(single ? 'flex' : 'grid grid-cols-3 gap-2')}>
      {attachments.map((attachment, index) => (
        <Attachment
          key={`${attachment.url}-${index}`}
          attachment={attachment}
          length={attachments.length}
        />
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
  const isImage = attachment.type.startsWith('image');
  const single = length === 1;
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
          'w-full px-3 py-2 rounded bg-accent flex items-center gap-3 cursor-pointer no-underline hover:bg-accent/70',
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
            // Single image: hug the picture so it shows at its natural aspect
            // ratio (no crop), capped to the bubble width. Multiple: square
            // thumbnail cell in the grid.
            single ? 'w-fit max-w-full' : 'w-full aspect-square',
          )}
        >
          <Img
            src={readImage(attachment.url)}
            alt={attachment.name}
            loading="lazy"
            className={cn(
              single
                ? 'block max-h-96 max-w-full object-contain'
                : 'size-full object-cover',
            )}
          />
        </button>
      </Dialog.Trigger>
      <Dialog.Content className="max-w-fit border-0 bg-transparent p-0 shadow-none">
        <Img
          src={readImage(attachment.url)}
          alt={attachment.name}
          className="max-w-[90vw] max-h-[90vh] rounded-lg object-contain"
        />
      </Dialog.Content>
    </Dialog>
  );
};
