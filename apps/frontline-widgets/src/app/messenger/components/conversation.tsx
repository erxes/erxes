import {
  IconBrain,
  IconCircleDashed,
  IconFile,
  IconSparkles,
} from '@tabler/icons-react';
import { differenceInHours, differenceInMinutes, format } from 'date-fns';
import DOMPurify from 'dompurify';
import {
  Avatar,
  Badge,
  Button,
  cn,
  formatDateISOStringToRelativeDate,
  readImage,
  Tooltip,
} from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useMemo } from 'react';
import { useGetMessengerSupporters } from '../hooks/useGetMessengerSupporters';
import {
  ReadConversationResult,
  useReadConversation,
} from '../hooks/useReadConversation';
import {
  connectionAtom,
  conversationIdAtom,
  setActiveTabAtom,
} from '../states';
import { IAttachment, IConversationMessage, ISupporter } from '../types';
import { AvatarGroup } from './avatar-group';

const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const minutes = differenceInMinutes(now, date);
  if (minutes < 1) return 'just now';
  if (minutes < 5) return 'few minutes ago';
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = differenceInHours(now, date);
  if (hours < 24) return `${hours} hours ago`;
  return format(date, 'MMM dd, yyyy, HH:mm');
};

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
              AI Agent
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
            AI Agent · Automated
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
}) {
  const isImageAttachment = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  };

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <div className="flex items-end justify-start gap-2 mr-auto max-w-[80%]">
            {showAvatar ? (
              <Avatar className="size-8 shrink-0 mb-5">
                <Avatar.Image
                  src={readImage(src || 'assets/user.webp')}
                  className="shrink-0 object-cover"
                  alt="Erxes"
                />
                <Avatar.Fallback className="bg-background">C</Avatar.Fallback>
              </Avatar>
            ) : (
              <div className="size-8 shrink-0" />
            )}
            <div className="flex flex-col gap-0.5 flex-1">
              {(isFirstMessage || isSingleMessage) && userName && (
                <span className="text-[11px] text-muted-foreground px-1 font-medium">
                  {userName}
                </span>
              )}
              {content && content !== '<p></p>' && (
                <div
                  className={cn(
                    'h-auto font-normal flex flex-col justify-start items-start text-sm leading-snug text-foreground/85 text-left gap-1 px-3 py-2 bg-background whitespace-break-spaces wrap-break-word break-all',
                    // no attachments follow — full position-based radius
                    !attachments?.length &&
                      isSingleMessage &&
                      'rounded-2xl rounded-bl-sm shadow-sm',
                    !attachments?.length &&
                      isFirstMessage &&
                      'rounded-2xl rounded-b-sm shadow-2xs',
                    !attachments?.length &&
                      isMiddleMessage &&
                      'rounded-sm shadow-2xs',
                    !attachments?.length &&
                      isLastMessage &&
                      'rounded-2xl rounded-l-sm rounded-tr-sm shadow-2xs',
                    !attachments?.length &&
                      isSingleMessage &&
                      isFirstMessage &&
                      'rounded-2xl rounded-bl-sm shadow-2xs',
                    // attachments follow — only top radius applies
                    attachments?.length &&
                      (isSingleMessage || isFirstMessage) &&
                      'rounded-t-2xl rounded-bl-sm shadow-sm',
                    attachments?.length &&
                      (isMiddleMessage || isLastMessage) &&
                      'rounded-tr-2xl rounded-bl-sm rounded-tl-sm',
                  )}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(content as string),
                  }}
                />
              )}
              {attachments && attachments.length > 0 && (
                <div className="flex flex-col gap-0.5">
                  {attachments.map((attachment, index) => {
                    const isFirstAttachment = index === 0;
                    const isLastAttachment = index === attachments.length - 1;
                    return (
                      <div
                        key={index}
                        className={cn(
                          'overflow-hidden bg-background',
                          // top radius: flat if content precedes, else use position
                          content &&
                            isFirstAttachment &&
                            (isSingleMessage || isFirstMessage) &&
                            'rounded-t-sm',
                          content &&
                            isFirstAttachment &&
                            (isMiddleMessage || isLastMessage) &&
                            'rounded-t-sm',
                          !content &&
                            isFirstAttachment &&
                            (isSingleMessage || isFirstMessage) &&
                            'rounded-t-2xl',
                          !content &&
                            isFirstAttachment &&
                            (isMiddleMessage || isLastMessage) &&
                            'rounded-sm',
                          // bottom radius: use position on last attachment
                          isLastAttachment &&
                            (isSingleMessage || isLastMessage) &&
                            'rounded-b-2xl rounded-bl-sm shadow-2xs',
                          isLastAttachment &&
                            (isFirstMessage || isMiddleMessage) &&
                            'rounded-sm',
                        )}
                      >
                        {isImageAttachment(attachment.url) ? (
                          <a
                            href={readImage(attachment.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={readImage(attachment.url)}
                              alt={attachment.name}
                              className="max-w-full h-auto rounded"
                            />
                          </a>
                        ) : (
                          <a
                            href={readImage(attachment.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 hover:bg-accent/50 transition-colors truncate"
                          >
                            <IconFile />
                            <span className="text-[13px] text-foreground truncate">
                              {attachment.name}
                            </span>
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {/* timestamp */}
              {(isLastMessage || isSingleMessage) && (
                <span className="text-[10px] text-muted-foreground px-1 mt-0.5">
                  {formatRelativeTime(createdAt)}
                </span>
              )}
            </div>
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content>
          {format(createdAt, 'MMM dd, yyyy hh:mm aa')}
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
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
}: {
  content?: string;
  createdAt: Date;
  attachments?: IAttachment[];
  isFirstMessage?: boolean;
  isLastMessage?: boolean;
  isMiddleMessage?: boolean;
  isSingleMessage?: boolean;
}) => {
  const isImageAttachment = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  };

  return (
    <Tooltip.Provider>
      <Tooltip delayDuration={100}>
        <Tooltip.Trigger asChild>
          <div className="flex flex-col items-end ml-auto max-w-[70%]">
            <div className="flex flex-col gap-2 w-fit">
              {content && content !== '<p></p>' && (
                <div
                  className={cn(
                    'h-auto font-medium flex flex-col justify-start items-start text-[13px] leading-relaxed text-left gap-1 px-3 py-2 bg-primary text-primary-foreground',
                    // no attachments follow — full position-based radius
                    !attachments?.length &&
                      isSingleMessage &&
                      'rounded-2xl shadow-sm',
                    !attachments?.length &&
                      isFirstMessage &&
                      'rounded-2xl rounded-br-sm',
                    !attachments?.length &&
                      isMiddleMessage &&
                      'rounded-2xl rounded-tr-sm rounded-br-sm',
                    !attachments?.length &&
                      isLastMessage &&
                      'rounded-2xl rounded-tr-sm shadow-sm',
                    // attachments follow — only top radius
                    attachments?.length &&
                      (isSingleMessage || isFirstMessage) &&
                      'rounded-t-2xl',
                    attachments?.length &&
                      (isMiddleMessage || isLastMessage) &&
                      'rounded-tl-2xl rounded-tr-sm',
                  )}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(content as string),
                  }}
                />
              )}
              {attachments && attachments.length > 0 && (
                <div className="flex flex-col gap-0.5">
                  {attachments.map((attachment, index) => {
                    const isFirstAttachment = index === 0;
                    const isLastAttachment = index === attachments.length - 1;
                    return (
                      <div
                        key={index}
                        className={cn(
                          'overflow-hidden bg-accent',
                          !content &&
                            isFirstAttachment &&
                            (isSingleMessage || isFirstMessage) &&
                            'rounded-t-2xl',
                          !content &&
                            isFirstAttachment &&
                            (isMiddleMessage || isLastMessage) &&
                            'rounded-tl-2xl rounded-tr-sm',
                          isLastAttachment &&
                            (isSingleMessage || isLastMessage) &&
                            'rounded-b-2xl rounded-br-sm shadow-sm',
                          isLastAttachment &&
                            (isFirstMessage || isMiddleMessage) &&
                            'rounded-b-2xl rounded-br-sm',
                        )}
                      >
                        {isImageAttachment(attachment.url) ? (
                          <a
                            href={readImage(attachment.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={readImage(attachment.url)}
                              alt={attachment.name}
                              className="max-w-full h-auto rounded"
                            />
                          </a>
                        ) : (
                          <a
                            href={readImage(attachment.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-2 hover:bg-accent/70 transition-colors truncate"
                          >
                            <IconFile />
                            <span className="text-[13px] text-zinc-900 truncate">
                              {attachment.name}
                            </span>
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {(isLastMessage || isSingleMessage) && (
              <span className="text-[10px] text-muted-foreground mt-0.5 pr-0.5">
                {formatRelativeTime(createdAt)}
              </span>
            )}
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content>
          {format(createdAt, 'MMM dd, yyyy hh:mm aa')}
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
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
}: {
  content?: string;
  botData?: any[];
  createdAt?: Date;
  showAvatar?: boolean;
  isFirstMessage?: boolean;
  isLastMessage?: boolean;
  isMiddleMessage?: boolean;
  isSingleMessage?: boolean;
}) => {
  const htmlContent = botData?.length
    ? botData.map((item: any) => item?.text || item?.content || '').join('')
    : content
      ? `<p>${content}</p>`
      : '';

  if (createdAt) {
    return (
      <Tooltip.Provider>
        <Tooltip>
          <Tooltip.Trigger asChild>
            <div className="flex items-end justify-start gap-2 mr-auto max-w-[80%]">
              {showAvatar ? (
                <div className="mb-5 size-8 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <IconBrain size={20} />
                </div>
              ) : (
                // <div
                //   className="size-8 shrink-0 mb-5 rounded-full bg-size-[50%] bg-no-repeat bg-center bg-primary"
                //   style={{ backgroundImage: defaultLogo }}
                // />
                <div className="size-8 shrink-0" />
              )}
              <div className="flex flex-col gap-0.5 flex-1">
                {(isFirstMessage || isSingleMessage) && (
                  <span className="text-[11px] text-muted-foreground px-1 font-medium">
                    Ai Agent{' '}
                    <Badge
                      variant={'ghost'}
                      className="text-[10px] leading-none rounded-xl bg-primary/15 text-primary h-auto py-0.5"
                    >
                      Ai
                    </Badge>
                  </span>
                )}
                {htmlContent && htmlContent !== '<p></p>' && (
                  <div
                    className={cn(
                      'h-auto font-normal flex flex-col justify-start items-start text-sm leading-snug text-foreground/85 text-left gap-1 px-3 py-2 bg-background whitespace-break-spaces wrap-break-word text-pretty',
                      isSingleMessage && 'rounded-2xl rounded-bl-sm shadow-sm',
                      isFirstMessage && 'rounded-2xl rounded-b-sm shadow-2xs',
                      isMiddleMessage && 'rounded-sm shadow-2xs',
                      isLastMessage && 'rounded-2xl rounded-bl-sm shadow-2xs',
                    )}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(htmlContent),
                    }}
                  />
                )}
                {(isLastMessage || isSingleMessage) && (
                  <span className="text-[10px] text-muted-foreground px-1 mt-0.5">
                    {formatRelativeTime(createdAt)}
                  </span>
                )}
              </div>
            </div>
          </Tooltip.Trigger>
          <Tooltip.Content>
            {format(createdAt, 'MMM dd, yyyy hh:mm aa')}
          </Tooltip.Content>
        </Tooltip>
      </Tooltip.Provider>
    );
  }

  return (
    <div className="flex justify-start items-end gap-2">
      <div
        className="w-8 h-8 rounded-full bg-size-[50%] bg-no-repeat bg-center mb-5 bg-primary"
        style={{ backgroundImage: defaultLogo }}
      />
      <div className="flex flex-col">
        <span className="text-[11px] text-muted-foreground px-1 font-medium">
          Erxes
        </span>
        <span className="h-auto font-medium flex flex-col justify-start items-start text-sm leading-snug text-foreground text-left gap-1 px-3 py-2 bg-background whitespace-break-spaces wrap-break-word break-all rounded-lg shadow-2xs">
          {content}
        </span>
      </div>
    </div>
  );
};

export const WelcomeMessage = ({ content }: { content?: string }) => {
  return (
    <div className="flex items-end self-start gap-2">
      <div
        className="w-8 h-8 rounded-full bg-size-[50%] bg-no-repeat bg-center bg-primary"
        style={{ backgroundImage: defaultLogo }}
      />
      <div className="flex flex-col max-w-3/4">
        <span className="h-auto font-medium flex flex-col justify-start items-start text-sm leading-snug text-foreground/85 text-pretty text-left gap-1 px-3 py-2 bg-background whitespace-break-spaces rounded-2xl rounded-bl-sm shadow-2xs">
          {content}
        </span>
      </div>
    </div>
  );
};
