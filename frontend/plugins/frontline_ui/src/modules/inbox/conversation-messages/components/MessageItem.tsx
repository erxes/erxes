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
import { DiscordMessageActions } from '@/integrations/discord/components/DiscordMessageActions';
import { IconBrain, IconFile, IconSparkles } from '@tabler/icons-react';

const Img = (props: JSX.IntrinsicElements['img']) => (
  // skipcq: JS-W1015
  <img {...props} />
);

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
export const MessageItem = () => {
  const { previousMessage, nextMessage, ...message } =
    useConversationMessageContext();
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
        <div
          className={cn(
            'min-w-0 max-w-[428px]',
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
                content={displayContent}
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
              Message deleted on Discord
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
          {!isDeleted && <Attachments attachments={attachments} />}
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
        'flex items-end w-full gap-3',
        isOutgoing ? 'justify-end' : 'justify-start',
        !separateNext && !isBotMessage && 'px-11',
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
