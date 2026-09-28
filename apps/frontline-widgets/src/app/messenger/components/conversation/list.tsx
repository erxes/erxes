import { IconCircleDashed, IconSparkles } from '@tabler/icons-react';
import DOMPurify from 'dompurify';
import {
  Avatar,
  Badge,
  cn,
  formatDateISOStringToRelativeDate,
  readImage,
} from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useMemo } from 'react';
import {
  ReadConversationResult,
  useReadConversation,
} from '../../hooks/useReadConversation';
import {
  connectionAtom,
  conversationIdAtom,
  setActiveTabAtom,
} from '../../states';
import type { IConversationMessage } from '../../types';

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
