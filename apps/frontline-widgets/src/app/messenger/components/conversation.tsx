import {
  IconBrain,
  IconCircleDashed,
  IconHeadset,
  IconPlayerPlay,
  IconRobot,
  IconSparkles,
  IconTicket,
} from '@tabler/icons-react';
import DOMPurify from 'dompurify';
import {
  Avatar,
  Badge,
  Button,
  cn,
  formatDateISOStringToRelativeDate,
  Input,
  readImage,
} from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useMemo, useState } from 'react';
import { hasMessageContent, Message, MessagePosition } from './message';
import { useGetMessengerSupporters } from '../hooks/useGetMessengerSupporters';
import {
  ReadConversationResult,
  useReadConversation,
} from '../hooks/useReadConversation';
import {
  connectionAtom,
  conversationIdAtom,
  setActiveTabAtom,
  uiOptionsAtom,
} from '../states';
import { IAttachment, IConversationMessage, ISupporter } from '../types';
import { AvatarGroup } from './avatar-group';

const defaultLogo =
  'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAB0CAMAAAAl8kW/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAACglBMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AAABxMqsfAAAA1HRSTlMAKRBgAZQKd1JAthrjKAXDiY7kDFT+WifxwNT7LKORaOg0+V8T4McCt/wzf5ZH7B7rBsjLkzgEWZ9PKvTvFSN2DddujVuq0hHnQnA9cSQ7pdzb8xtTBwO7c8SkhIdLRqhiIe74CM31jPAtm3zfYdpvL7EPtK73aXWCNko+4acZUCAcwrmK0PpRbSXZTqC+wTdmNR/2iOoxbNg6P4ESulcOj/0wxURjeM6cFLVdkC7yHZ5FfpcXyuZWaukJmpimr+0iGHmsQdUmekyzsoa/uFzdleIWoh4NTwYAAAABYktHRACIBR1IAAAACXBIWXMAAAsSAAALEgHS3X78AAAEk0lEQVRo3s3Z+UMUVRwA8Oc6bh60JjYVoSkbpaOI7KprHpikEhSiKGxFmG3YiomGW9BlmgWImrdU3hmVZ3afdtl92P39g3oX2wzL7rw38/2h9wsz7/jsLPN9875vh5D/eRmC7AWG4nrGsCAueNVwXG/ESFxvVN7VqF5o9DW4Fzgmfyyqd615Hap3/Q0FBqYXvLFwHOoFjoebUL0JMDGA6RWF4WZMr/gWuBXzjkyaDNYUzAucClCC6U2zoLQY0ZteBjAB0YtEAWZMQgRnApizcnWIhbS82QBwW+4uc3Qiau48gPnlufssuF3dW1hBL/AOt16LFiuDS6hXGXPrdWdVtaJ3F/XMu9371ZQtVfJqwxRcptAxsryuXKFbeT71VqxU+eh6iDa4dorfQz24V+m7GPdBo2vw3M+8CsWonWVCk0uXVSYDH1DzCFkN8GDODomHmLdE1SOJZgjnCp41DzMvOV0ZJGsBWtZlb36EebBe3SOBUoDWrMGzgXsb3UPBVh6lI6JZ0se2JAdX6XgkVEeHbIoP1pTayL3HtDxChrNBgwWP8Tj32hOaIBnNhnVk1j/BPXhS1yNPsdC1nh5Y/YzFvc0e0vNn2cCBwbOlSlzgVn2PPNfORuZts9fFnhfeCx48Qjr52C77l1srvG5v6XmgjI+2Bc92U4Buj45spUcMT2cuO1pEhef0PLRTAD3iNNglTsF7er5dANYufvai9Hb7SAb3CCK5lx7vk56v9Hy/vAs0eKY0S9Bfer5MKpWJVnlUlfIFHmiXzkH513d6fgicxXd6nup1eNZLPj1CXnaACOl57BWbh5Kez7GB+xA8QgrSHlJ6fjgNHkHxyNE0qJEu5yg7mtPg/GMY4HHbTVmE4J2wh2HzAd/eyXxHYI/3Db7qnMqnXvPptRUOeDh4W0DTxeiTjjnzlDx63Rf4Rv+FdZI35dFpP7OluFQqx+naXCKP1bdumeWMNFrP0pP4OXmilbk6ymG5RCXFUzVVKU5rvHqx/oX9vKzYliceil6XqRrpXUjXvCWy60PevJUXhVdg23/t4unmwbc9gavlGu/YXXTwune8eO/Kx8F+ZzWfipaHbKRBbB4y9nzxTaxWd09By3vCez+jIRhl9SN0vQUiBemLZDZ9wILnQ90EYiT3Pho1WNs6lsh+rOfVcy9cO3hrdRhgudZPUGPFlPgkWzvLPXt0wE63aGsC+PSkujuum6cJa7L3MBp1dnsG3y715pxfn0Vh3hZVcCifDC6RVl4HlxS9Y71KD72lpYWKr7Q+Z94X7v2qw18qeXvZ8talsh1ebNYq9Iqfpt5XXyt99vo+hU5sw2hNU/vnGI3ur8kus3n6jZpHSKTE9fdNtnP6Vv1JkvrOpUM19b5fqOzRWZ+7uaECoOUHDc+t/Eizop8QvQRddqcieuRngF8wX93QLdNOf5thZwluhotzMb9wE5j1mN6QbvgV0zOuwG9x/8x/5Xf4A2Xf1V8CE5NtmB75E2ajekXWGFQvPuMK6g0hHX+pvEFRL39XFaF65J8NuN6RYbhe6FLEP2Iv55WTHrVyuQ3XI7jX9y/JAcmAtCI0lQAAAABJRU5ErkJggg==)';

export function EmptyChat() {
  const connection = useAtomValue(connectionAtom);
  const { messengerData } = connection?.widgetsMessengerConnect || {};
  const { responseRate } = messengerData || {};
  const { list } = useGetMessengerSupporters();
  return (
    <div className="flex flex-col gap-4 font-medium text-sm">
      <div className="my-auto flex items-center gap-2">
        <AvatarGroup max={3} size="default">
          {list &&
            list?.map((supporter: ISupporter) => (
              <Avatar
                className="border-2 border-sidebar size-10"
                size="xl"
                key={supporter._id}
              >
                <Avatar.Image
                  src={readImage(supporter.details.avatar)}
                  className="shrink-0 object-cover"
                  alt={
                    supporter.details.fullName || supporter.details.firstName
                  }
                />
                <Avatar.Fallback>
                  {supporter.details.firstName?.charAt(0) || 'C'}
                </Avatar.Fallback>
              </Avatar>
            ))}
        </AvatarGroup>
        <span className="text-muted-foreground font-medium text-sm">
          Our usual reply time
        </span>{' '}
        <mark className="bg-transparent text-primary font-medium text-sm">
          ({responseRate ? `a few ${responseRate}` : 'a few minutes'})
        </mark>
      </div>
    </div>
  );
}

export function ConversationMessage({
  conversationId,
  conversation,
}: {
  conversationId: string;
  conversation?: IConversationMessage;
}) {
  const setConversationId = useSetAtom(conversationIdAtom);
  const setActiveTab = useSetAtom(setActiveTabAtom);

  const connection = useAtomValue(connectionAtom);

  const { widgetsMessengerConnect } = connection || {};
  const { messengerData } = widgetsMessengerConnect || {};
  const { aiAgentLabel } = messengerData || {};

  const { readConversation } = useReadConversation();
  const { messages, content } = conversation || {};
  const lastMessage = messages?.[messages.length - 1];
  const { userId, customerId, user, isCustomerRead, fromBot } =
    lastMessage || {};

  const handleClick = () => {
    readConversation({
      variables: { conversationId: conversationId },
      onCompleted: (data: ReadConversationResult) => {
        setConversationId(data.widgetsReadConversationMessages);
        setActiveTab('chat');
      },
    });
  };

  const unreadCount = useMemo(
    () =>
      messages?.filter(
        (message) => !message.isCustomerRead && message.userId !== null,
      ).length,
    [messages],
  );

  const isUnread = !!(unreadCount && unreadCount > 0 && !isCustomerRead);

  if (customerId) {
    return (
      <div
        role="tabpanel"
        id={lastMessage?._id}
        tabIndex={0}
        className="flex items-center gap-3 cursor-pointer p-3 rounded-2xl bg-background shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 hover:bg-accent/40 opacity-60 hover:opacity-80"
        onClick={handleClick}
      >
        <Avatar className="size-10 grayscale">
          <Avatar.Image className="shrink-0 object-cover" alt="you" />
          <Avatar.Fallback className="bg-background">C</Avatar.Fallback>
        </Avatar>
        <div className="flex flex-col gap-0.5 overflow-x-hidden flex-1 min-w-0">
          <span className="truncate text-xs text-muted-foreground font-bold">
            you
          </span>
          <span className="text-xs text-muted-foreground/70">
            Sent a message·{' '}
            {formatDateISOStringToRelativeDate(
              lastMessage?.createdAt as unknown as string,
            )}
          </span>
        </div>
      </div>
    );
  } else if (fromBot) {
    return (
      <div
        role="tabpanel"
        id={lastMessage?._id}
        tabIndex={0}
        className={cn(
          'flex items-center gap-3 rounded-2xl cursor-pointer bg-background shadow-xs p-3 transition-all duration-200',
          isUnread
            ? 'bg-primary/8 hover:bg-primary/12'
            : 'hover:opacity-75 hover:bg-accent/30',
        )}
        onClick={handleClick}
      >
        <div className="relative shrink-0">
          <div
            className={cn(
              'size-10 rounded-xl flex items-center justify-center bg-linear-to-br from-primary to-primary/40',
              // !isUnread && 'grayscale',
            )}
          >
            <IconSparkles size={20} className="text-primary-foreground" />
          </div>
          {isUnread && (
            <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-primary border-2 border-background" />
          )}
        </div>

        <div className="flex flex-col gap-0.5 overflow-x-hidden flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                'text-xs truncate',
                isUnread
                  ? 'font-bold text-foreground'
                  : 'font-medium text-muted-foreground',
              )}
            >
              {aiAgentLabel}
            </span>
            <span
              className={cn(
                'text-[10px] shrink-0',
                isUnread
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground/60',
              )}
            >
              {formatDateISOStringToRelativeDate(
                lastMessage?.createdAt as unknown as string,
              )}
            </span>
          </div>
          {unreadCount && unreadCount > 1 ? (
            <span className="truncate text-sm font-semibold text-primary">
              {unreadCount} new messages
            </span>
          ) : (
            <span
              className={cn(
                'truncate line-clamp-2 text-xs',
                isUnread
                  ? 'font-semibold text-foreground/90'
                  : 'font-normal text-muted-foreground/70',
              )}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(lastMessage?.content || ''),
              }}
            />
          )}
          <Badge
            variant={'ghost'}
            className="text-[10px] leading-none rounded-xl bg-primary/15 text-primary h-auto py-0.5 mt-0.5"
          >
            <IconCircleDashed size={10} />
            AI Bot · Automated
          </Badge>
        </div>

        {isUnread && unreadCount && (
          <span className="shrink-0 min-w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1.5">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>
    );
  } else if (userId) {
    return (
      <div
        role="tabpanel"
        id={lastMessage?._id}
        tabIndex={0}
        className={cn(
          'flex items-center gap-3 rounded-2xl cursor-pointer bg-background shadow-xs p-3 transition-all duration-200',
          isUnread
            ? 'bg-primary/8 hover:bg-primary/12'
            : 'opacity-55 hover:opacity-75 hover:bg-accent/30',
        )}
        onClick={handleClick}
      >
        <div className="relative shrink-0">
          <Avatar
            className={cn('size-10 bg-background', !isUnread && 'grayscale')}
          >
            <Avatar.Image
              src={readImage(user?.details?.avatar) || 'assets/user.webp'}
              className="shrink-0 object-cover"
              alt={user?.details?.fullName}
            />
            <Avatar.Fallback>
              {user?.details?.fullName?.charAt(0) || 'C'}
            </Avatar.Fallback>
          </Avatar>
          {isUnread && (
            <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-primary border-2 border-background" />
          )}
        </div>

        <div className="flex flex-col gap-0.5 overflow-x-hidden flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                'text-xs truncate',
                isUnread
                  ? 'font-bold text-foreground'
                  : 'font-medium text-muted-foreground',
              )}
            >
              {user?.details?.fullName ||
                user?.details?.firstName ||
                'Operator'}
            </span>
            <span
              className={cn(
                'text-[10px] shrink-0',
                isUnread
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground/60',
              )}
            >
              {formatDateISOStringToRelativeDate(
                lastMessage?.createdAt as unknown as string,
              )}
            </span>
          </div>
          {unreadCount && unreadCount > 1 ? (
            <span className={cn('truncate text-sm font-semibold text-primary')}>
              {unreadCount} new messages
            </span>
          ) : (
            <span
              className={cn(
                'truncate line-clamp-1 text-sm',
                isUnread
                  ? 'font-semibold text-foreground/90'
                  : 'font-normal text-muted-foreground/70',
              )}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(content || ''),
              }}
            />
          )}
        </div>

        {isUnread && unreadCount && (
          <span className="shrink-0 min-w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1.5">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>
    );
  }
  return null;
}

function OperatorMessageBody({
  position,
  userName,
  isFirstMessage,
  isSingleMessage,
  hasContent,
  content,
  hasAttachments,
  onReply,
  onCopy,
  attachments,
  isLastMessage,
  createdAt,
}: {
  position: MessagePosition;
  userName?: string;
  isFirstMessage?: boolean;
  isSingleMessage?: boolean;
  hasContent: boolean;
  content: string;
  hasAttachments: boolean;
  onReply?: () => void;
  onCopy?: () => void;
  attachments?: IAttachment[];
  isLastMessage?: boolean;
  createdAt: Date;
}) {
  return (
    <Message.Body align="start">
      {(isFirstMessage || isSingleMessage) && userName && (
        <Message.Author>{userName}</Message.Author>
      )}
      <div className="flex items-center gap-1">
        {hasContent && (
          <Message.Content
            variant="incoming"
            position={position}
            hasAttachments={hasAttachments}
            html={content}
          />
        )}
        <Message.ItemActions align="start" onReply={onReply} onCopy={onCopy} />
      </div>
      <Message.Attachments attachments={attachments} align="start" />
      {(isLastMessage || isSingleMessage) && (
        <Message.Time align="start" date={createdAt} />
      )}
    </Message.Body>
  );
}

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
  onCopy?: () => void;
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
      {/* Tooltip scoped to the bubble row. Nothing interactive lives inside. */}
      <Message.TimestampTooltip date={createdAt}>
        <Message.Row className="group/message relative">
          <Message.Avatar
            show={showAvatar}
            src={src || 'assets/user.webp'}
            alt={userName || 'Erxes'}
            // Only the rendered avatar carried the bottom offset before.
            className={showAvatar ? 'mb-5' : undefined}
          />
          <OperatorMessageBody
            position={position}
            userName={userName}
            isFirstMessage={isFirstMessage}
            isSingleMessage={isSingleMessage}
            hasContent={hasContent}
            content={content}
            hasAttachments={hasAttachments}
            onReply={onReply}
            onCopy={onCopy}
            attachments={attachments}
            isLastMessage={isLastMessage}
            createdAt={createdAt}
          />
        </Message.Row>
      </Message.TimestampTooltip>
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
  onCopy?: () => void;
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
    // `align="end"` is where the old `isOwnMessage` branch now lives.
    <Message.TimestampTooltip date={createdAt} delayDuration={100}>
      <Message align="end">
        <Message.Body align="end" className="group/message relative">
          <div className="flex items-center gap-1 flex-row-reverse">
            {hasContent && (
              <Message.Content
                variant="outgoing"
                position={position}
                hasAttachments={hasAttachments}
                html={content}
              />
            )}
            <Message.ItemActions
              align="end"
              onReply={onReply}
              onCopy={onCopy}
            />
          </div>
          <Message.Attachments attachments={attachments} align="end" />
        </Message.Body>
        {(isLastMessage || isSingleMessage) && (
          <Message.Time align="end" date={createdAt} />
        )}
      </Message>
    </Message.TimestampTooltip>
  );
};

const TicketFormInline = ({
  onSubmit,
}: {
  onSubmit: (payload: Record<string, string>) => void;
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      'ticket:name': name.trim(),
      'ticket:description': description.trim(),
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-1 mt-1">
        <IconTicket size={13} className="text-primary shrink-0" />
        Ticket info submitted
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-2 w-full">
      <Input
        placeholder="Ticket name *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="text-sm h-8"
        required
      />
      <Input
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="text-sm h-8"
      />
      <Button
        type="submit"
        size="sm"
        className="h-7 text-xs self-start rounded-xl"
        disabled={!name.trim()}
      >
        <IconTicket size={13} />
        Submit
      </Button>
    </form>
  );
};

export const BotMessage = ({
  content,
  botData,
  createdAt,
  showAvatar = true,
  isFirstMessage,
  isLastMessage,
  isMiddleMessage,
  isSingleMessage,
  showOperatorToggle,
  operatorStatus,
  onToggleOperator,
  onQuickReply,
  onGetStarted,
  onTicketFormSubmit,
  onReply,
  onCopy,
}: {
  content?: string;
  botData?: any[];
  createdAt?: Date;
  showAvatar?: boolean;
  isFirstMessage?: boolean;
  isLastMessage?: boolean;
  isMiddleMessage?: boolean;
  isSingleMessage?: boolean;
  showOperatorToggle?: boolean;
  operatorStatus?: 'bot' | 'operator';
  onToggleOperator?: () => void;
  onQuickReply?: (title: string) => void;
  onGetStarted?: () => void;
  onTicketFormSubmit?: (payload: Record<string, string>) => void;
  onReply?: () => void;
  onCopy?: () => void;
}) => {
  const uiOptions = useAtomValue(uiOptionsAtom);

  const connection = useAtomValue(connectionAtom);

  const { widgetsMessengerConnect } = connection || {};
  const { messengerData } = widgetsMessengerConnect || {};
  const { aiAgentLabel } = messengerData || {};

  const hasTicketForm = botData?.some(
    (item: any) => item?.type === 'ticketForm',
  );
  const textItems = botData?.filter(
    (item: any) => item?.type !== 'quickReplies' && item?.type !== 'ticketForm',
  );
  const quickReplies: Array<{ title: string }> =
    botData?.find((item: any) => item?.type === 'quickReplies')?.elements || [];

  const htmlContent = textItems?.length
    ? textItems.map((item: any) => item?.text || item?.content || '').join('')
    : content
      ? `<p>${content}</p>`
      : '';

  if (createdAt) {
    const position: MessagePosition = {
      isFirstMessage,
      isLastMessage,
      isMiddleMessage,
      isSingleMessage,
    };
    const showTrailingSlots = isLastMessage || isSingleMessage;

    return (
      <Message align="start">
        {/*
          A11y fix: the tooltip trigger now wraps ONLY the bubble row. It used
          to wrap the whole component, nesting the quick-reply buttons and the
          ticket form's inputs inside a tooltip trigger.
        */}
        <Message.TimestampTooltip date={createdAt}>
          <Message.Row className="group/message relative">
            <Message.Avatar show={showAvatar} className="mb-4">
              <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <IconBrain size={20} aria-hidden="true" />
              </div>
            </Message.Avatar>
            <Message.Body align="start">
              {(isFirstMessage || isSingleMessage) && (
                <Message.Author>
                  {aiAgentLabel}{' '}
                  <Badge
                    variant={'ghost'}
                    className="text-[10px] leading-none rounded-xl bg-primary/15 text-primary h-auto py-0.5"
                  >
                    Auto
                  </Badge>
                </Message.Author>
              )}
              <div className="flex items-center gap-1">
                {hasMessageContent(htmlContent) && (
                  <Message.Content
                    variant="bot"
                    position={position}
                    html={htmlContent}
                  />
                )}
                <Message.ItemActions
                  align="start"
                  onReply={onReply}
                  onCopy={onCopy}
                />
              </div>
              {showTrailingSlots && (
                <Message.Time align="start" date={createdAt} />
              )}
            </Message.Body>
          </Message.Row>
        </Message.TimestampTooltip>

        {showTrailingSlots &&
          (quickReplies.length > 0 || showOperatorToggle) && (
            <Message.Actions>
              {quickReplies.length > 0 &&
                onQuickReply &&
                quickReplies.map((qr, idx) => (
                  <Button
                    key={idx}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onQuickReply(qr.title)}
                    className="h-7 text-xs gap-1.5 rounded-xl border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
                  >
                    {qr.title}
                  </Button>
                ))}
              {showOperatorToggle && (
                // Message.Action == prompt-kit's MessageAction: control + tooltip.
                <Message.Action
                  label={
                    operatorStatus === 'operator'
                      ? 'Hand the conversation back to the bot'
                      : 'Ask for a human agent'
                  }
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onToggleOperator}
                    className="h-7 text-xs gap-1.5 rounded-xl border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
                  >
                    {operatorStatus === 'operator' ? (
                      <>
                        <IconRobot size={13} aria-hidden="true" />
                        Talk to bot
                      </>
                    ) : (
                      <>
                        <IconHeadset size={13} aria-hidden="true" />
                        Talk to human
                      </>
                    )}
                  </Button>
                </Message.Action>
              )}
            </Message.Actions>
          )}

        {showTrailingSlots && hasTicketForm && onTicketFormSubmit && (
          <div className="pl-10 mt-1.5">
            <TicketFormInline onSubmit={onTicketFormSubmit} />
          </div>
        )}
      </Message>
    );
  }

  // Greeting variant: no timestamp, so no grouping and no tooltip.
  return (
    <div className="flex self-start items-start gap-2 my-2">
      <Message.Avatar show={showAvatar} className="place-self-end mb-2">
        <div className="size-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          <IconBrain size={20} aria-hidden="true" />
        </div>
      </Message.Avatar>
      <div className="flex flex-col gap-1">
        <Message.Author>
          {aiAgentLabel}{' '}
          <Badge
            variant={'ghost'}
            className="text-[10px] leading-none rounded-xl bg-primary/15 text-primary h-auto py-0.5"
          >
            Bot
          </Badge>
        </Message.Author>
        <Message.Content
          variant="incoming"
          position={{ isSingleMessage: true }}
          className="font-medium"
        >
          {content}
        </Message.Content>

        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {onGetStarted && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onGetStarted}
              className="self-start h-7 text-xs gap-1.5 rounded-xl text-primary hover:bg-primary/10 hover:text-primary"
            >
              <IconPlayerPlay size={13} aria-hidden="true" />
              Get Started
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export const WelcomeMessage = ({ content }: { content?: string }) => {
  const uiOptions = useAtomValue(uiOptionsAtom);
  return (
    <div className="flex items-end self-start gap-2 mb-2">
      {uiOptions?.logo && uiOptions?.logo?.length > 0 ? (
        <div className="bg-foreground/5 size-8 rounded flex items-center justify-center p-1">
          <img
            alt="logo"
            src={readImage(uiOptions?.logo)}
            className="object-center object-scale-down"
          />
        </div>
      ) : (
        <div
          className="size-8 rounded-full bg-size-[50%] bg-no-repeat bg-center bg-primary"
          style={{
            backgroundImage: defaultLogo,
          }}
        />
      )}
      <div className="flex flex-col max-w-3/4">
        {/* `shadow-2xs` overrides the variant's `shadow-sm` via tailwind-merge. */}
        <Message.Content
          variant="bot"
          position={{ isSingleMessage: true }}
          className="font-medium shadow-2xs"
        >
          {content}
        </Message.Content>
      </div>
    </div>
  );
};
